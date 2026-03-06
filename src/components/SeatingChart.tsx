"use client";

import { VenueLayout, SectionDef, VenueType, getVenueLayout, generateGenericLayout } from "@/lib/venueLayouts";

interface SeatInfo {
  ticketId: string;
  section: string;
  row: string;
  seat: string;
}

interface SeatingChartProps {
  venueName: string;
  seats: SeatInfo[];
  selectedTicketId: string | null;
  onSeatClick: (ticketId: string | null) => void;
  eventType?: string;
  layoutType?: VenueType | null;
}

export default function SeatingChart({ venueName, seats, selectedTicketId, onSeatClick, eventType, layoutType }: SeatingChartProps) {
  // Get venue layout — auto-classifies by name + event type, or uses stored layout type
  const uniqueSections = [...new Set(seats.map((s) => s.section))];
  const layout: VenueLayout = getVenueLayout(venueName, eventType, layoutType);

  // Build lookup: section → tickets in that section
  const sectionTickets: Record<string, SeatInfo[]> = {};
  for (const s of seats) {
    if (!sectionTickets[s.section]) sectionTickets[s.section] = [];
    sectionTickets[s.section].push(s);
  }

  // Find which section the selected ticket is in
  const selectedSeat = seats.find((s) => s.ticketId === selectedTicketId);
  const selectedSection = selectedSeat?.section ?? null;

  const { width, height, courtOrStage: cos, sections, tierColors } = layout;
  const padding = 40;
  const vw = width + padding * 2;
  const vh = height + padding * 2;

  // Legend tiers present
  const tiersPresent = [...new Set(sections.map((s) => s.tier))];

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {layout.name} — Seating Map
        </p>
        {/* Legend */}
        <div className="flex items-center gap-3">
          {tiersPresent.map((tier) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: tierColors[tier],
                  opacity: 0.8,
                }}
              />
              <span className="text-[0.6rem] text-[var(--text-muted)] capitalize">{tier}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: "#22c55e",
              }}
            />
            <span className="text-[0.6rem] text-[var(--text-muted)]">Available</span>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${vw} ${vh}`}
          style={{ width: "100%", height: "auto", minHeight: "220px", maxHeight: "400px" }}
        >
          {/* Court / Stage */}
          <g transform={`translate(${padding}, ${padding})`}>
            {cos.shape === "ellipse" ? (
              <ellipse
                cx={cos.x + cos.width / 2}
                cy={cos.y + cos.height / 2}
                rx={cos.width / 2}
                ry={cos.height / 2}
                fill="var(--bg-card)"
                stroke="var(--border)"
                strokeWidth={1.5}
              />
            ) : (
              <rect
                x={cos.x}
                y={cos.y}
                width={cos.width}
                height={cos.height}
                rx={6}
                fill="var(--bg-card)"
                stroke="var(--border)"
                strokeWidth={1.5}
              />
            )}
            <text
              x={cos.x + cos.width / 2}
              y={cos.y + cos.height / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text-muted)"
              fontSize={13}
              fontWeight={700}
              letterSpacing="0.15em"
            >
              {cos.label}
            </text>

            {/* Sections */}
            {sections.map((sec) => {
              const hasTickets = !!sectionTickets[sec.id];
              const isSelected = sec.id === selectedSection;
              const ticketsInSection = sectionTickets[sec.id] || [];
              const ticketCount = ticketsInSection.length;
              const baseColor = tierColors[sec.tier] || "#6366f1";

              // Determine fill
              let fill: string;
              let opacity: number;
              let strokeColor: string;
              let strokeWidth: number;

              if (isSelected) {
                fill = "#22c55e";
                opacity = 1;
                strokeColor = "#fff";
                strokeWidth = 2;
              } else if (hasTickets) {
                fill = "#22c55e";
                opacity = 0.7;
                strokeColor = "#22c55e";
                strokeWidth = 1;
              } else {
                fill = baseColor;
                opacity = 0.15;
                strokeColor = baseColor;
                strokeWidth = 0.5;
              }

              const handleClick = () => {
                if (hasTickets) {
                  // Click first ticket in section, or deselect
                  if (isSelected) {
                    onSeatClick(null);
                  } else {
                    onSeatClick(ticketsInSection[0].ticketId);
                  }
                }
              };

              return (
                <g
                  key={sec.id}
                  transform={`translate(${sec.x}, ${sec.y}) rotate(${sec.rotation || 0})`}
                  onClick={handleClick}
                  style={{ cursor: hasTickets ? "pointer" : "default" }}
                >
                  {/* Glow for selected */}
                  {isSelected && (
                    <rect
                      x={-sec.width / 2 - 4}
                      y={-sec.height / 2 - 4}
                      width={sec.width + 8}
                      height={sec.height + 8}
                      rx={6}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={2}
                      opacity={0.5}
                    >
                      <animate
                        attributeName="opacity"
                        values="0.5;0.2;0.5"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </rect>
                  )}

                  {/* Section rectangle */}
                  <rect
                    x={-sec.width / 2}
                    y={-sec.height / 2}
                    width={sec.width}
                    height={sec.height}
                    rx={4}
                    fill={fill}
                    opacity={opacity}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />

                  {/* Section label */}
                  <text
                    x={0}
                    y={hasTickets && ticketCount > 0 ? -2 : 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isSelected || hasTickets ? "#fff" : baseColor}
                    fontSize={hasTickets ? 9 : 8}
                    fontWeight={isSelected ? 800 : hasTickets ? 700 : 500}
                    opacity={isSelected || hasTickets ? 1 : 0.4}
                    // Counter-rotate text so it's always readable
                    transform={`rotate(${-(sec.rotation || 0)})`}
                  >
                    {sec.label}
                  </text>

                  {/* Ticket count badge */}
                  {hasTickets && ticketCount > 0 && (
                    <text
                      x={0}
                      y={8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected ? "#fff" : "rgba(255,255,255,0.8)"}
                      fontSize={7}
                      fontWeight={600}
                      transform={`rotate(${-(sec.rotation || 0)})`}
                    >
                      {ticketCount} tix
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

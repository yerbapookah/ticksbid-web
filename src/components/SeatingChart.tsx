"use client";

import { useState, useRef, useCallback } from "react";
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
  const layout: VenueLayout = getVenueLayout(venueName, eventType, layoutType);

  const sectionTickets: Record<string, SeatInfo[]> = {};
  for (const s of seats) {
    if (!sectionTickets[s.section]) sectionTickets[s.section] = [];
    sectionTickets[s.section].push(s);
  }

  const selectedSeat = seats.find((s) => s.ticketId === selectedTicketId);
  const selectedSection = selectedSeat?.section ?? null;

  const { width, height, courtOrStage: cos, sections, tierColors } = layout;
  const padding = 40;
  const vw = width + padding * 2;
  const vh = height + padding * 2;
  const tiersPresent = [...new Set(sections.map((s) => s.tier))];

  // ── Zoom & Pan state ──
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: vw, h: vh });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vbx: 0, vby: 0 });
  const MIN_ZOOM = 1;   // never zoom out past default view
  const MAX_ZOOM = 5;   // can zoom in 5x

  const getScale = useCallback(() => viewBox.w / vw, [viewBox.w, vw]);

  function zoom(delta: number, clientX?: number, clientY?: number) {
    setViewBox((vb) => {
      const scale = vb.w / vw;
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale * (1 - delta)));
      const newW = vw * newScale;
      const newH = vh * newScale;

      // Zoom toward cursor position if provided, otherwise center
      let focusX = 0.5, focusY = 0.5;
      if (clientX !== undefined && clientY !== undefined && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        focusX = (clientX - rect.left) / rect.width;
        focusY = (clientY - rect.top) / rect.height;
      }

      return {
        x: vb.x + (vb.w - newW) * focusX,
        y: vb.y + (vb.h - newH) * focusY,
        w: newW,
        h: newH,
      };
    });
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15; // scroll down = zoom out
    zoom(delta, e.clientX, e.clientY);
  }

  function handlePointerDown(e: React.PointerEvent) {
    // Only pan on middle click or when not clicking a section
    if (e.button === 1 || (e.target as Element).tagName === "svg" || (e.target as Element).tagName === "rect" && !(e.target as Element).closest("[data-section]")) {
      setIsPanning(true);
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        vbx: viewBox.x,
        vby: viewBox.y,
      };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isPanning || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - panStart.current.x) * scaleX;
    const dy = (e.clientY - panStart.current.y) * scaleY;
    setViewBox((vb) => ({
      ...vb,
      x: panStart.current.vbx - dx,
      y: panStart.current.vby - dy,
    }));
  }

  function handlePointerUp() {
    setIsPanning(false);
  }

  function resetView() {
    setViewBox({ x: 0, y: 0, w: vw, h: vh });
  }

  const zoomLevel = Math.round((1 / getScale()) * 100);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      {/* Header: title + legend + zoom controls */}
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {layout.name} — Seating Map
        </p>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3">
            {tiersPresent.map((tier) => (
              <div key={tier} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: tierColors[tier], opacity: 0.8 }} />
                <span className="text-[0.6rem] text-[var(--text-muted)] capitalize">{tier}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#22c55e" }} />
              <span className="text-[0.6rem] text-[var(--text-muted)]">Available</span>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-[var(--border)] pl-3">
            <button
              onClick={() => zoom(0.25)}
              className="flex h-6 w-6 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              title="Zoom in"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
              </svg>
            </button>
            <button
              onClick={resetView}
              className="flex h-6 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-card)] px-1.5 text-[0.6rem] font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] tabular-nums"
              title="Reset zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={() => zoom(-0.25)}
              className="flex h-6 w-6 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              title="Zoom out"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* SVG container */}
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "8px",
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          style={{ width: "100%", height: "auto", minHeight: "220px", maxHeight: "450px", display: "block" }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
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

              let fill: string;
              let opacity: number;
              let strokeColor: string;
              let strokeW: number;

              if (isSelected) {
                fill = "#22c55e"; opacity = 1; strokeColor = "#fff"; strokeW = 2;
              } else if (hasTickets) {
                fill = "#22c55e"; opacity = 0.7; strokeColor = "#22c55e"; strokeW = 1;
              } else {
                fill = baseColor; opacity = 0.15; strokeColor = baseColor; strokeW = 0.5;
              }

              const handleClick = (e: React.MouseEvent) => {
                if (!hasTickets) return;
                e.stopPropagation();
                if (isSelected) {
                  onSeatClick(null);
                } else {
                  onSeatClick(ticketsInSection[0].ticketId);
                }
              };

              return (
                <g
                  key={sec.id}
                  data-section={sec.id}
                  transform={`translate(${sec.x}, ${sec.y}) rotate(${sec.rotation || 0})`}
                  onClick={handleClick}
                  style={{ cursor: hasTickets ? "pointer" : "default" }}
                >
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
                      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
                    </rect>
                  )}

                  <rect
                    x={-sec.width / 2}
                    y={-sec.height / 2}
                    width={sec.width}
                    height={sec.height}
                    rx={4}
                    fill={fill}
                    opacity={opacity}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />

                  <text
                    x={0}
                    y={hasTickets && ticketCount > 0 ? -2 : 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isSelected || hasTickets ? "#fff" : baseColor}
                    fontSize={hasTickets ? 9 : 8}
                    fontWeight={isSelected ? 800 : hasTickets ? 700 : 500}
                    opacity={isSelected || hasTickets ? 1 : 0.4}
                    transform={`rotate(${-(sec.rotation || 0)})`}
                  >
                    {sec.label}
                  </text>

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

      {/* Mobile legend (below chart) */}
      <div className="mt-2 flex sm:hidden items-center gap-3 justify-center flex-wrap">
        {tiersPresent.map((tier) => (
          <div key={tier} className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: tierColors[tier], opacity: 0.8 }} />
            <span className="text-[0.6rem] text-[var(--text-muted)] capitalize">{tier}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#22c55e" }} />
          <span className="text-[0.6rem] text-[var(--text-muted)]">Available</span>
        </div>
      </div>
    </div>
  );
}

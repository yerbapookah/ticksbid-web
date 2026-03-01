"use client";

import { useState, MutableRefObject } from "react";
import AuctionTicketCard from "@/components/AuctionTicketCard";

interface TicketData {
  id: string;
  seat_section: string;
  seat_row: string;
  seat_number: string;
  ticket_type: string | null;
  auction?: {
    auction_item_id: string;
    auction_status: string;
    end_time: string;
    reserve_price: number;
    buy_it_now_price: number;
    highest_bid: number;
  };
}

type SortOption =
  | "default"
  | "bid_high"
  | "bid_low"
  | "bin_high"
  | "bin_low"
  | "ending_soon"
  | "ending_last";

const SORT_LABELS: Record<SortOption, string> = {
  default: "Default",
  bid_high: "Current Bid: High → Low",
  bid_low: "Current Bid: Low → High",
  bin_high: "Buy Now: High → Low",
  bin_low: "Buy Now: Low → High",
  ending_soon: "Ending Soonest",
  ending_last: "Ending Latest",
};

function sortTickets(tickets: TicketData[], sort: SortOption): TicketData[] {
  const sorted = [...tickets];
  switch (sort) {
    case "bid_high":
      return sorted.sort((a, b) => (b.auction?.highest_bid ?? 0) - (a.auction?.highest_bid ?? 0));
    case "bid_low":
      return sorted.sort((a, b) => (a.auction?.highest_bid ?? 0) - (b.auction?.highest_bid ?? 0));
    case "bin_high":
      return sorted.sort((a, b) => (b.auction?.buy_it_now_price ?? 0) - (a.auction?.buy_it_now_price ?? 0));
    case "bin_low":
      return sorted.sort((a, b) => (a.auction?.buy_it_now_price ?? 0) - (b.auction?.buy_it_now_price ?? 0));
    case "ending_soon":
      return sorted.sort((a, b) => {
        const aEnd = a.auction?.end_time ? new Date(a.auction.end_time).getTime() : Infinity;
        const bEnd = b.auction?.end_time ? new Date(b.auction.end_time).getTime() : Infinity;
        return aEnd - bEnd;
      });
    case "ending_last":
      return sorted.sort((a, b) => {
        const aEnd = a.auction?.end_time ? new Date(a.auction.end_time).getTime() : 0;
        const bEnd = b.auction?.end_time ? new Date(b.auction.end_time).getTime() : 0;
        return bEnd - aEnd;
      });
    default:
      return sorted;
  }
}

export default function TicketList({
  tickets,
  eventName,
  selectedTicketId,
  onTicketSelect,
  ticketRefs,
}: {
  tickets: TicketData[];
  eventName: string;
  selectedTicketId?: string | null;
  onTicketSelect?: (ticketId: string) => void;
  ticketRefs?: MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  const [sort, setSort] = useState<SortOption>("default");
  const [open, setOpen] = useState(false);

  const sorted = sortTickets(tickets, sort);

  return (
    <div>
      {/* Sort dropdown */}
      <div className="relative mb-4">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
        >
          <svg className="h-3.5 w-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span>{SORT_LABELS[sort]}</span>
          <svg className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-2xl shadow-black/60" style={{ backdropFilter: 'none', backgroundColor: 'var(--bg-card)' }}>
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSort(key);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-card-hover)] ${
                    sort === key
                      ? "text-[var(--accent)] font-medium"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {sort === key && (
                    <svg className="mr-2 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span style={sort === key ? {} : { marginLeft: '1.375rem' }}>{SORT_LABELS[key]}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Ticket cards */}
      <div className="flex flex-col gap-3">
        {sorted.map((ticket) => (
          <div
            key={ticket.id}
            ref={(el) => { if (ticketRefs) ticketRefs.current[ticket.id] = el; }}
          >
            <AuctionTicketCard
              ticketId={ticket.id}
              section={ticket.seat_section}
              row={ticket.seat_row}
              seat={ticket.seat_number}
              ticketType={ticket.ticket_type ?? undefined}
              eventName={eventName}
              auctionId={ticket.auction?.auction_item_id || ticket.id}
              buyItNowPrice={ticket.auction?.buy_it_now_price}
              currentBid={ticket.auction?.highest_bid ?? null}
              auctionStatus={ticket.auction?.auction_status}
              auctionEndTime={ticket.auction?.end_time}
              expired={ticket.auction?.end_time ? new Date(ticket.auction.end_time) < new Date() : false}
              selected={selectedTicketId === ticket.id}
              onSelect={onTicketSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

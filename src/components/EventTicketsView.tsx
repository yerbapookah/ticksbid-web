"use client";

import { useState, useRef } from "react";
import SeatingChart from "@/components/SeatingChart";
import TicketList from "@/components/TicketList";

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

export default function EventTicketsView({
  tickets,
  eventName,
  venueName,
}: {
  tickets: TicketData[];
  eventName: string;
  venueName?: string;
}) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const ticketRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const seats = tickets.map((t) => ({
    ticketId: t.id,
    section: t.seat_section,
    row: t.seat_row,
    seat: t.seat_number,
  }));

  function handleSeatClick(ticketId: string | null) {
    setSelectedTicketId(ticketId);
    if (ticketId) {
      const el = ticketRefs.current[ticketId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  function handleTicketSelect(ticketId: string) {
    setSelectedTicketId((prev) => (prev === ticketId ? null : ticketId));
  }

  return (
    <div>
      {/* Seating chart */}
      {tickets.length > 0 && (
        <div className="mb-4">
          <SeatingChart
            venueName={venueName || "generic"}
            seats={seats}
            selectedTicketId={selectedTicketId}
            onSeatClick={handleSeatClick}
          />
        </div>
      )}

      {/* Ticket list */}
      <TicketList
        tickets={tickets}
        eventName={eventName}
        selectedTicketId={selectedTicketId}
        onTicketSelect={handleTicketSelect}
        ticketRefs={ticketRefs}
      />
    </div>
  );
}

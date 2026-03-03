import { getTicketsWithAuctions } from "@/lib/data";
import type { Tool } from "./index";

const listTickets: Tool = {
  definition: {
    name: "list_tickets",
    description:
      "List all available tickets for an event with seat info and auction prices.",
    input_schema: {
      type: "object",
      properties: {
        event_id: {
          type: "string",
          description: "The event UUID to list tickets for",
        },
      },
      required: ["event_id"],
    },
  },

  async execute(input) {
    try {
      const tickets = await getTicketsWithAuctions(String(input.event_id));
      if (tickets.length === 0) return "No tickets listed for this event.";
      return tickets
        .map((t) => {
          let line = `[${t.id}] Section ${t.seat_section}, Row ${t.seat_row}, Seat ${t.seat_number}`;
          if (t.ticket_type) line += ` (${t.ticket_type})`;
          if (t.auction) {
            line += `\n  Status: ${t.auction.auction_status ?? "N/A"}`;
            line += `\n  Current Bid: $${Number(t.auction.highest_bid ?? 0).toFixed(2)}`;
            line += `\n  Reserve Price: $${Number(t.auction.reserve_price ?? 0).toFixed(2)}`;
            line += `\n  Buy Now Price: $${Number(t.auction.buy_it_now_price ?? 0).toFixed(2)}`;
            line += `\n  Auction Ends: ${t.auction.end_time ?? "N/A"}`;
          } else {
            line += "\n  Auction info unavailable";
          }
          return line;
        })
        .join("\n\n");
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : e}`;
    }
  },
};

export default listTickets;

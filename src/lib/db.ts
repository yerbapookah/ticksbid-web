import { sql } from "@vercel/postgres";

export interface TicketRow {
  id: string;
  event_id: string;
  seat_section: string;
  seat_row: string;
  seat_number: string;
  ticket_type: string | null;
}

export interface AuctionState {
  auction_item_id: string;
  auction_status: string;
  end_time: string;
  reserve_price: number;
  buy_it_now_price: number;
  highest_bid: number;
}

export interface TicketWithAuction extends TicketRow {
  auction?: AuctionState;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

async function fetchAuctionState(ticketId: string): Promise<AuctionState | null> {
  try {
    const res = await fetch(`${API_BASE}/auction_states/${ticketId}`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getLocalHighestBid(ticketId: string): Promise<number> {
  try {
    const { rows } = await sql`
      SELECT COALESCE(MAX(bid_amount), 0) as max_bid
      FROM bids
      WHERE auction_id = ${ticketId}::uuid
    `;
    return parseFloat(rows[0]?.max_bid || "0");
  } catch {
    return 0;
  }
}

export async function getTicketCountsByEvent(): Promise<Record<string, number>> {
  try {
    const { rows } = await sql`
      SELECT event_id, COUNT(*)::int as count
      FROM tickets
      GROUP BY event_id
    `;
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.event_id] = row.count;
    }
    return counts;
  } catch {
    return {};
  }
}

export async function getTicketsWithAuctions(eventId: string): Promise<TicketWithAuction[]> {
  // 1. Get ticket catalog from Vercel Postgres
  const { rows } = await sql`
    SELECT id, event_id, seat_section, seat_row, seat_number, ticket_type
    FROM tickets
    WHERE event_id = ${eventId}::uuid
    ORDER BY seat_section, seat_row, seat_number
  `;

  if (rows.length === 0) return [];

  // 2. Fetch live auction state from AWS API + local bids for each ticket
  const tickets: TicketWithAuction[] = await Promise.all(
    rows.map(async (row) => {
      const [auction, localHighest] = await Promise.all([
        fetchAuctionState(row.id),
        getLocalHighestBid(row.id),
      ]);

      // Merge: use whichever highest bid is greater
      if (auction) {
        auction.highest_bid = Math.max(auction.highest_bid || 0, localHighest);
      }

      return {
        id: row.id,
        event_id: row.event_id,
        seat_section: row.seat_section,
        seat_row: row.seat_row,
        seat_number: row.seat_number,
        ticket_type: row.ticket_type,
        auction: auction ?? undefined,
      };
    })
  );

  return tickets;
}

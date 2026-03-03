/**
 * Unified data layer — the ONLY file that talks to the AWS API.
 * Everything else (pages, API routes, chat tools) imports from here.
 *
 * If the backend ever moves, update API_BASE and these functions — nothing else.
 */

import { sql } from "@vercel/postgres";

const API_BASE =
  process.env.TICKSBID_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------
async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Venue {
  id: string;
  name: string;
  address: string;
  venue_type: string;
  max_capacity: number;
}

export interface Ticket {
  id: string;
  event_id: string;
  seat_section: string;
  seat_row: string;
  seat_number: string;
  ticket_type?: string;
}

export interface Event {
  id: string;
  name: string;
  event_type: string;
  venue_id: string;
  start_time: string;
  thumbnail_url?: string;
  event_url?: string;
  tickets: Ticket[];
  venue: Venue;
}

export interface EventSummary {
  id: string;
  name: string;
  event_type: string;
  venue_id: string;
  start_time: string;
  thumbnail_url?: string;
}

export interface AuctionState {
  auction_item_id: string;
  auction_status: string;
  end_time: string;
  reserve_price: number;
  buy_it_now_price: number;
  highest_bid: number;
}

export interface TicketWithAuction {
  id: string;
  event_id: string;
  seat_section: string;
  seat_row: string;
  seat_number: string;
  ticket_type: string | null;
  auction?: AuctionState;
}

export interface AuctionDetail {
  id: string;
  end_time: string;
  reserve_price: number;
  buy_it_now_price: number;
  bids: { auction_item_id: string; bid_amount: number; bidder_name?: string; bid_timestamp: string }[];
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export async function searchEvents(
  query?: string,
  eventType?: string,
  limit = 20
): Promise<EventSummary[]> {
  const params: Record<string, string> = { limit: String(limit) };
  if (query) params.q = query;
  if (eventType) params.event_type = eventType;
  return apiGet<EventSummary[]>("/events", params);
}

export async function getEvent(id: string): Promise<Event> {
  return apiGet<Event>(`/events/${id}`);
}

export async function getEventNames(
  query?: string,
  eventType?: string
): Promise<string[]> {
  const params: Record<string, string> = {};
  if (query) params.q = query;
  if (eventType) params.event_type = eventType;
  return apiGet<string[]>("/event_names", params);
}

// ---------------------------------------------------------------------------
// Auction states (from AWS API)
// ---------------------------------------------------------------------------
export async function getAuctionState(
  ticketId: string
): Promise<AuctionState | null> {
  try {
    return await apiGet<AuctionState>(`/auction_states/${ticketId}`);
  } catch {
    return null;
  }
}

export async function getAuctionDetail(
  ticketId: string
): Promise<AuctionDetail[]> {
  return apiGet<AuctionDetail[]>(`/auctions?auction_item_ids=${ticketId}`);
}

// ---------------------------------------------------------------------------
// Tickets + bids (Neon Postgres)
// ---------------------------------------------------------------------------
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

export async function getTicketsWithAuctions(
  eventId: string
): Promise<TicketWithAuction[]> {
  const { rows } = await sql`
    SELECT id, event_id, seat_section, seat_row, seat_number, ticket_type
    FROM tickets
    WHERE event_id = ${eventId}::uuid
    ORDER BY seat_section, seat_row, seat_number
  `;

  if (rows.length === 0) return [];

  return Promise.all(
    rows.map(async (row) => {
      const [auction, localHighest] = await Promise.all([
        getAuctionState(row.id),
        getLocalHighestBid(row.id),
      ]);

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
}

export async function getLocalBids(
  ticketId: string
): Promise<{ auction_item_id: string; bid_amount: number; bidder_name: string; bid_timestamp: string }[]> {
  try {
    const { rows } = await sql`
      SELECT auction_id as auction_item_id, bid_amount, bidder_name, bid_timestamp
      FROM bids
      WHERE auction_id = ${ticketId}::uuid
      ORDER BY bid_timestamp ASC
    `;
    return rows.map((r) => ({
      auction_item_id: r.auction_item_id,
      bid_amount: parseFloat(r.bid_amount),
      bidder_name: r.bidder_name,
      bid_timestamp: r.bid_timestamp,
    }));
  } catch {
    return [];
  }
}

export async function placeBid(
  auctionId: string,
  bidAmount: number,
  bidderName: string
): Promise<{ id: string; bid_amount: number; bidder_name: string; bid_timestamp: string }> {
  await sql`
    CREATE TABLE IF NOT EXISTS bids (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      auction_id UUID NOT NULL,
      bid_amount DECIMAL(10,2) NOT NULL,
      bidder_name VARCHAR(100),
      bid_timestamp TIMESTAMPTZ DEFAULT now()
    )
  `;

  const { rows } = await sql`
    INSERT INTO bids (auction_id, bid_amount, bidder_name)
    VALUES (${auctionId}::uuid, ${bidAmount}, ${bidderName || "Anonymous"})
    RETURNING id, bid_amount, bidder_name, bid_timestamp
  `;

  return {
    id: rows[0].id,
    bid_amount: parseFloat(rows[0].bid_amount),
    bidder_name: rows[0].bidder_name,
    bid_timestamp: rows[0].bid_timestamp,
  };
}

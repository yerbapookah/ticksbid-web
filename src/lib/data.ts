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
  layout_type?: string | null;
  layout_json?: string | null;
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
  // Try Neon first — fuzzy multi-token search across event + venue + performer
  try {
    // Enable trigram extension for fuzzy matching
    try { await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`; } catch { /* already exists */ }

    const conditions: string[] = [];
    let neonQuery: string;

    if (query) {
      // Split search into tokens, sanitize
      const tokens = query.trim().split(/\s+/).filter(Boolean).map(t => t.replace(/'/g, "''").toLowerCase());

      // For each token, compute best similarity across event name, venue name, performer name
      // Also give credit for substring (LIKE) matches to handle exact partial matches
      const tokenScores = tokens.map(t => `GREATEST(
        COALESCE(similarity(LOWER(e.name), '${t}'), 0),
        COALESCE(similarity(LOWER(COALESCE(v.name, '')), '${t}'), 0),
        COALESCE(similarity(LOWER(COALESCE(p.name, '')), '${t}'), 0),
        CASE WHEN LOWER(e.name) LIKE '%${t}%' THEN 0.6 ELSE 0 END,
        CASE WHEN LOWER(COALESCE(v.name, '')) LIKE '%${t}%' THEN 0.6 ELSE 0 END,
        CASE WHEN LOWER(COALESCE(p.name, '')) LIKE '%${t}%' THEN 0.6 ELSE 0 END
      )`);

      const scoreExpr = tokenScores.join(' + ');

      neonQuery = `
        SELECT e.id, e.name, e.event_type, e.venue_id, e.start_time, e.thumbnail_url,
               (${scoreExpr}) as score
        FROM event e
        LEFT JOIN venue v ON e.venue_id = v.id
        LEFT JOIN performer p ON LOWER(split_part(e.name, ' @ ', 1)) = LOWER(p.name)
      `;
      // Require minimum relevance
      conditions.push(`(${scoreExpr}) > 0.15`);
    } else {
      neonQuery = `
        SELECT e.id, e.name, e.event_type, e.venue_id, e.start_time, e.thumbnail_url,
               0 as score
        FROM event e
      `;
    }

    // Event type filter (supports comma-separated multi-select)
    if (eventType) {
      const types = eventType.split(',').filter(Boolean).map(t => `'${t.replace(/'/g, "''")}'`);
      if (types.length === 1) {
        conditions.push(`e.event_type = ${types[0]}`);
      } else if (types.length > 1) {
        conditions.push(`e.event_type IN (${types.join(',')})`);
      }
    }

    // Only future events
    conditions.push(`(e.start_time IS NULL OR e.start_time > NOW() - INTERVAL '1 day')`);
    if (conditions.length > 0) neonQuery += ` WHERE ${conditions.join(' AND ')}`;

    // Sort by relevance when searching, by date otherwise
    if (query) {
      neonQuery += ` ORDER BY score DESC, e.start_time ASC NULLS LAST LIMIT ${limit}`;
    } else {
      neonQuery += ` ORDER BY e.start_time ASC NULLS LAST LIMIT ${limit}`;
    }

    const { rows } = await sql.query(neonQuery);
    if (rows.length > 0) {
      const neonEvents: EventSummary[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        event_type: r.event_type || 'concert',
        venue_id: r.venue_id,
        start_time: r.start_time,
        thumbnail_url: r.thumbnail_url,
      }));
      // Also fetch from AWS and merge (dedup by name+date)
      try {
        const params: Record<string, string> = { limit: String(limit) };
        if (query) params.q = query;
        if (eventType) params.event_type = eventType;
        const awsEvents = await apiGet<EventSummary[]>("/events", params);
        const seen = new Set(neonEvents.map(e => e.name + (e.start_time || '')));
        for (const ae of awsEvents) {
          if (!seen.has(ae.name + (ae.start_time || ''))) {
            neonEvents.push(ae);
          }
        }
      } catch { /* AWS unavailable, Neon-only is fine */ }
      return neonEvents.slice(0, limit);
    }
  } catch (err) { console.error('Neon search error:', err); /* fall through */ }

  // Fallback to AWS API
  const params: Record<string, string> = { limit: String(limit) };
  if (query) params.q = query;
  if (eventType) params.event_type = eventType;
  return apiGet<EventSummary[]>("/events", params);
}

export async function getEvent(id: string): Promise<Event> {
  // Try Neon first
  try {
    const { rows } = await sql`
      SELECT e.id, e.name, e.event_type, e.venue_id, e.start_time, e.thumbnail_url, e.event_url,
             v.name as venue_name, v.address as venue_address, v.venue_type, v.max_capacity, v.layout_type, v.layout_json
      FROM event e
      LEFT JOIN venue v ON e.venue_id = v.id
      WHERE e.id = ${id}::uuid
      LIMIT 1
    `;
    if (rows.length > 0) {
      const r = rows[0];
      // Get tickets for this event from Neon (if any)
      let tickets: Ticket[] = [];
      try {
        const { rows: ticketRows } = await sql`
          SELECT id, event_id, seat_section, seat_row, seat_number, ticket_type
          FROM tickets WHERE event_id = ${id}::uuid
        `;
        tickets = ticketRows as Ticket[];
      } catch { /* no tickets table or no tickets */ }
      return {
        id: r.id,
        name: r.name,
        event_type: r.event_type || 'concert',
        venue_id: r.venue_id,
        start_time: r.start_time,
        thumbnail_url: r.thumbnail_url,
        event_url: r.event_url,
        venue: {
          id: r.venue_id || '',
          name: r.venue_name || '',
          address: r.venue_address || '',
          venue_type: r.venue_type || '',
          max_capacity: r.max_capacity || 0,
          layout_type: r.layout_type || null,
          layout_json: r.layout_json || null,
        },
        tickets,
      };
    }
  } catch { /* fall through */ }

  // Fallback to AWS
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
  // Try AWS API first
  try {
    return await apiGet<AuctionState>(`/auction_states/${ticketId}`);
  } catch {
    // Fall through to local
  }

  // Fallback: check local auction_states_local table
  try {
    const { rows } = await sql`
      SELECT ticket_id as auction_item_id, auction_status, end_time,
             reserve_price, buy_it_now_price
      FROM auction_states_local
      WHERE ticket_id = ${ticketId}::uuid
      LIMIT 1
    `;
    if (rows.length > 0) {
      return {
        auction_item_id: rows[0].auction_item_id,
        auction_status: rows[0].auction_status,
        end_time: rows[0].end_time,
        reserve_price: parseFloat(rows[0].reserve_price),
        buy_it_now_price: rows[0].buy_it_now_price ? parseFloat(rows[0].buy_it_now_price) : 0,
        highest_bid: 0,
      };
    }
  } catch {
    // table may not exist yet
  }

  return null;
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

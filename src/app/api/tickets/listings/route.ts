import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET /api/tickets/listings — fetch all user-listed tickets with auction state
export async function GET() {
  try {
    // Ensure tables exist before querying
    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_id UUID NOT NULL,
        seat_section VARCHAR(50) NOT NULL,
        seat_row VARCHAR(20) NOT NULL,
        seat_number VARCHAR(20) NOT NULL,
        ticket_type VARCHAR(50),
        seller_name VARCHAR(100),
        listed_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS auction_states_local (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ticket_id UUID NOT NULL UNIQUE,
        auction_status VARCHAR(20) DEFAULT 'active',
        reserve_price DECIMAL(10,2) NOT NULL,
        buy_it_now_price DECIMAL(10,2),
        end_time TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    const { rows } = await sql`
      SELECT
        t.id,
        t.event_id,
        t.seat_section,
        t.seat_row,
        t.seat_number,
        t.ticket_type,
        t.seller_name,
        t.listed_at,
        a.auction_status,
        a.reserve_price,
        a.buy_it_now_price,
        a.end_time
      FROM tickets t
      LEFT JOIN auction_states_local a ON a.ticket_id = t.id
      WHERE t.listed_at IS NOT NULL
      ORDER BY t.listed_at DESC
    `;

    // Enrich with event names from AWS API
    const API_BASE =
      process.env.TICKSBID_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

    const eventIds = [...new Set(rows.map((r) => r.event_id))];
    const eventMap: Record<string, { name: string; start_time: string; venue_name: string }> = {};

    await Promise.all(
      eventIds.map(async (eid) => {
        try {
          const res = await fetch(`${API_BASE}/events/${eid}`, { cache: "no-store" });
          if (res.ok) {
            const ev = await res.json();
            eventMap[eid] = {
              name: ev.name || "Unknown Event",
              start_time: ev.start_time || "",
              venue_name: ev.venue_name || "",
            };
          }
        } catch {
          // skip
        }
      })
    );

    // Check for highest bids
    let bidMap: Record<string, number> = {};
    try {
      const { rows: bidRows } = await sql`
        SELECT auction_id, MAX(bid_amount) as highest_bid
        FROM bids
        GROUP BY auction_id
      `;
      for (const b of bidRows) {
        bidMap[b.auction_id] = parseFloat(b.highest_bid);
      }
    } catch {
      // bids table may not exist
    }

    const listings = rows.map((r) => {
      const event = eventMap[r.event_id];
      return {
        id: r.id,
        event_id: r.event_id,
        event_name: event?.name || "Unknown Event",
        event_date: event?.start_time || null,
        venue_name: event?.venue_name || "",
        seat_section: r.seat_section,
        seat_row: r.seat_row,
        seat_number: r.seat_number,
        ticket_type: r.ticket_type,
        seller_name: r.seller_name,
        listed_at: r.listed_at,
        auction_status: r.auction_status || "active",
        reserve_price: r.reserve_price ? parseFloat(r.reserve_price) : 0,
        buy_it_now_price: r.buy_it_now_price ? parseFloat(r.buy_it_now_price) : null,
        end_time: r.end_time,
        highest_bid: bidMap[r.id] || 0,
      };
    });

    return NextResponse.json(listings);
  } catch (err) {
    console.error("Listings API error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

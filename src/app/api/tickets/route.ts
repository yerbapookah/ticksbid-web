import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getTicketsWithAuctions } from "@/lib/data";

const API_BASE =
  process.env.TICKSBID_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

// GET — list tickets for an event
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) {
    return NextResponse.json({ error: "event_id required" }, { status: 400 });
  }

  try {
    const tickets = await getTicketsWithAuctions(eventId);
    return NextResponse.json(
      tickets.map((t) => ({
        id: t.id,
        section: t.seat_section,
        row: t.seat_row,
        seat: t.seat_number,
        type: t.ticket_type,
        auction_id: t.auction?.auction_item_id,
        auction_status: t.auction?.auction_status,
        current_bid: t.auction?.highest_bid ?? 0,
        buy_now_price: t.auction?.buy_it_now_price,
        reserve_price: t.auction?.reserve_price,
        auction_ends: t.auction?.end_time,
      }))
    );
  } catch (err) {
    console.error("Tickets API error:", err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// POST — create a new ticket listing with auction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_id,
      seat_section,
      seat_row,
      seat_number,
      ticket_type,
      reserve_price,
      buy_it_now_price,
      auction_end_time,
      seller_name,
    } = body;

    // Validate required fields
    if (!event_id || !seat_section || !seat_row || !seat_number) {
      return NextResponse.json(
        { error: "event_id, seat_section, seat_row, and seat_number are required" },
        { status: 400 }
      );
    }

    if (!auction_end_time) {
      return NextResponse.json(
        { error: "auction_end_time is required" },
        { status: 400 }
      );
    }

    // Reserve is optional — defaults to 0 (no reserve)
    const resolvedReserve = reserve_price && reserve_price > 0 ? reserve_price : 0;

    if (buy_it_now_price && resolvedReserve > 0 && buy_it_now_price <= resolvedReserve) {
      return NextResponse.json(
        { error: "buy_it_now_price must be greater than reserve_price" },
        { status: 400 }
      );
    }

    // Ensure tables exist
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

    // Patch existing table: add missing columns + ensure id has a default
    try {
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS seller_name VARCHAR(100)`;
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS listed_at TIMESTAMPTZ DEFAULT now()`;
      await sql`ALTER TABLE tickets ALTER COLUMN id SET DEFAULT gen_random_uuid()`;
    } catch {
      // already set
    }

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

    // 1. Insert ticket into Vercel Postgres
    const { rows: ticketRows } = await sql`
      INSERT INTO tickets (event_id, seat_section, seat_row, seat_number, ticket_type, seller_name)
      VALUES (
        ${event_id}::uuid,
        ${seat_section},
        ${seat_row},
        ${seat_number},
        ${ticket_type || null},
        ${seller_name || 'Anonymous'}
      )
      RETURNING id, event_id, seat_section, seat_row, seat_number, ticket_type, listed_at
    `;

    const ticket = ticketRows[0];
    const ticketId = ticket.id;

    // 2. Use the auction end time provided by the client
    //    (already capped at 2hrs before event on the frontend)
    const endTime = new Date(auction_end_time).toISOString();

    // 3. Try to create auction state on AWS API
    let auctionCreatedOnAws = false;
    try {
      const awsRes = await fetch(`${API_BASE}/auction_states`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_item_id: ticketId,
          auction_status: "active",
          reserve_price: resolvedReserve,
          buy_it_now_price: buy_it_now_price || null,
          end_time: endTime,
        }),
      });
      if (awsRes.ok) {
        auctionCreatedOnAws = true;
      }
    } catch {
      // AWS API doesn't support POST — fall through to local
    }

    // 4. Always create local auction state as fallback/source of truth
    await sql`
      INSERT INTO auction_states_local (ticket_id, auction_status, reserve_price, buy_it_now_price, end_time)
      VALUES (
        ${ticketId}::uuid,
        'active',
        ${resolvedReserve},
        ${buy_it_now_price || null},
        ${endTime}::timestamptz
      )
    `;

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketId,
        event_id: ticket.event_id,
        seat_section: ticket.seat_section,
        seat_row: ticket.seat_row,
        seat_number: ticket.seat_number,
        ticket_type: ticket.ticket_type,
        listed_at: ticket.listed_at,
      },
      auction: {
        auction_item_id: ticketId,
        auction_status: "active",
        reserve_price: resolvedReserve,
        buy_it_now_price: buy_it_now_price || null,
        end_time: endTime,
        source: auctionCreatedOnAws ? "aws" : "local",
      },
    });
  } catch (err) {
    console.error("Create ticket error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

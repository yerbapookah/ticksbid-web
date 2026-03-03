import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const FAKE_USERS = [
  "TicketHunter23", "LiveShowFan", "NBADiehard", "ConcertQueen",
  "BidKing99", "SeatGeekGuru", "FrontRowJoe", "StubHubSteve",
  "ArenaAndy", "VenuVibes", "MoshPitMike", "BalconyBeth",
  "FloorSeatFred", "NosebleedNate", "VIPVicky", "LastMinLucy",
  "ScalperSlayer", "DealFinderDan", "ShowtimeSam", "EncoreEmma",
];

function randomUser() {
  return FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== "seedbids2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Ensure bids table exists
    await sql`
      CREATE TABLE IF NOT EXISTS bids (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        auction_id UUID NOT NULL,
        bid_amount DECIMAL(10,2) NOT NULL,
        bidder_name VARCHAR(100),
        bid_timestamp TIMESTAMPTZ DEFAULT now()
      )
    `;

    // Get all tickets
    const { rows: tickets } = await sql`SELECT id FROM tickets`;

    if (tickets.length === 0) {
      return NextResponse.json({ error: "no tickets found" }, { status: 404 });
    }

    // For each ticket, fetch its auction state to get reserve price
    const API_BASE =
      process.env.TICKSBID_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

    let totalBids = 0;

    for (const ticket of tickets) {
      const ticketId = ticket.id;

      // Get auction state for price range
      let reservePrice = 50;
      let buyNowPrice = 300;
      try {
        const res = await fetch(`${API_BASE}/auction_states/${ticketId}`, { cache: "no-store" });
        if (res.ok) {
          const auction = await res.json();
          reservePrice = parseFloat(auction.reserve_price) || 50;
          buyNowPrice = parseFloat(auction.buy_it_now_price) || reservePrice * 4;
        }
      } catch {
        // use defaults
      }

      // Clear existing bids for this ticket (fresh start)
      await sql`DELETE FROM bids WHERE auction_id = ${ticketId}::uuid`;

      // Generate 5-15 bids with escalating amounts
      const numBids = randomInt(5, 15);
      const priceRange = buyNowPrice * 0.85 - reservePrice;
      const baseTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // start 7 days ago
      const timeSpan = 6.5 * 24 * 60 * 60 * 1000; // spread over 6.5 days

      for (let i = 0; i < numBids; i++) {
        // Bids escalate from near reserve toward ~85% of buy-now
        const progress = (i + 0.5) / numBids;
        // Add some noise so it's not perfectly linear
        const noise = (Math.random() - 0.5) * (priceRange * 0.08);
        const bidAmount = Math.max(
          reservePrice + 1,
          +(reservePrice + priceRange * progress + noise).toFixed(2)
        );

        // Spread timestamps across the week
        const tsOffset = (timeSpan * (i / numBids)) + (Math.random() * timeSpan * 0.05);
        const bidTime = new Date(baseTime + tsOffset).toISOString();
        const bidder = randomUser();

        await sql`
          INSERT INTO bids (auction_id, bid_amount, bidder_name, bid_timestamp)
          VALUES (${ticketId}::uuid, ${bidAmount}, ${bidder}, ${bidTime}::timestamptz)
        `;
        totalBids++;
      }
    }

    return NextResponse.json({
      success: true,
      tickets_seeded: tickets.length,
      total_bids_inserted: totalBids,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

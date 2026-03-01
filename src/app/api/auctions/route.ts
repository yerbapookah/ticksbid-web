import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

export async function GET(req: NextRequest) {
  const ticketId = req.nextUrl.searchParams.get("ticket_id");
  if (!ticketId) {
    return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 });
  }

  try {
    // Fetch auction info from AWS
    const res = await fetch(`${API_BASE}/auctions?auction_item_ids=${ticketId}`);
    if (!res.ok) {
      return NextResponse.json({ error: "API error" }, { status: res.status });
    }
    const data = await res.json();

    if (data.length === 0) {
      return NextResponse.json(data);
    }

    // Fetch local bids from Vercel Postgres
    let localBids: any[] = [];
    try {
      const { rows } = await sql`
        SELECT auction_id as auction_item_id, bid_amount, bidder_name, bid_timestamp
        FROM bids
        WHERE auction_id = ${ticketId}::uuid
        ORDER BY bid_timestamp ASC
      `;
      localBids = rows.map(r => ({
        auction_item_id: r.auction_item_id,
        bid_amount: parseFloat(r.bid_amount),
        bidder_name: r.bidder_name,
        bid_timestamp: r.bid_timestamp,
      }));
    } catch {
      // bids table might not exist yet
    }

    // Merge: AWS bids + local bids
    const auction = data[0];
    const awsBids = auction.bids || [];
    const allBids = [...awsBids, ...localBids].sort(
      (a: any, b: any) => new Date(a.bid_timestamp).getTime() - new Date(b.bid_timestamp).getTime()
    );
    auction.bids = allBids;

    return NextResponse.json([auction]);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

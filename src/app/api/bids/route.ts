import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { getMinBid } from "@/lib/bidding";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

export async function POST(req: NextRequest) {
  try {
    const { auctionId, bidAmount, bidderName } = await req.json();

    if (!auctionId || !bidAmount) {
      return NextResponse.json(
        { error: "auctionId and bidAmount are required" },
        { status: 400 }
      );
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid bid amount" },
        { status: 400 }
      );
    }

    // Validate auction exists via AWS API
    const auctionRes = await fetch(`${API_BASE}/auction_states/${auctionId}`);
    if (!auctionRes.ok) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }
    const auction = await auctionRes.json();

    if (auction.auction_status !== "OPEN") {
      return NextResponse.json({ error: "Auction is not open" }, { status: 400 });
    }

    if (new Date(auction.end_time) < new Date()) {
      return NextResponse.json({ error: "Auction has ended" }, { status: 400 });
    }

    if (amount >= auction.buy_it_now_price) {
      return NextResponse.json(
        { error: "Bid must be less than the Buy It Now price" },
        { status: 400 }
      );
    }

    // Check current highest bid from AWS + local bids
    const currentMax = Math.max(
      auction.highest_bid || 0,
      // Also check local bids table
      ...await sql`SELECT COALESCE(MAX(bid_amount), 0) as max_bid FROM bids WHERE auction_id = ${auctionId}`
        .then(r => [parseFloat(r.rows[0]?.max_bid || "0")])
        .catch(() => [0])
    );

    const minBid = getMinBid(currentMax);
    if (amount < minBid) {
      return NextResponse.json(
        { error: `Minimum bid is $${minBid.toFixed(2)}` },
        { status: 400 }
      );
    }

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

    // Place the bid
    const { rows: newBid } = await sql`
      INSERT INTO bids (auction_id, bid_amount, bidder_name)
      VALUES (${auctionId}::uuid, ${amount}, ${bidderName || "Anonymous"})
      RETURNING id, bid_amount, bidder_name, bid_timestamp
    `;

    return NextResponse.json({
      success: true,
      bid: {
        id: newBid[0].id,
        bid_amount: parseFloat(newBid[0].bid_amount),
        bidder_name: newBid[0].bidder_name,
        bid_timestamp: newBid[0].bid_timestamp,
      },
    });
  } catch (err) {
    console.error("Bid error:", err);
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }
}

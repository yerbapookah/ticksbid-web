import { NextRequest, NextResponse } from "next/server";
import { getAuctionState, placeBid } from "@/lib/data";
import { getMinBid } from "@/lib/bidding";

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

    // Validate auction exists
    const auction = await getAuctionState(auctionId);
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

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

    const currentMax = auction.highest_bid || 0;
    const minBid = getMinBid(currentMax);
    if (amount < minBid) {
      return NextResponse.json(
        { error: `Minimum bid is $${minBid.toFixed(2)}` },
        { status: 400 }
      );
    }

    const bid = await placeBid(auctionId, amount, bidderName || "Anonymous");

    return NextResponse.json({ success: true, bid });
  } catch (err) {
    console.error("Bid error:", err);
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }
}

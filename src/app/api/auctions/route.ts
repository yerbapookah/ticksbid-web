import { NextRequest, NextResponse } from "next/server";
import { getAuctionDetail, getLocalBids } from "@/lib/data";

export async function GET(req: NextRequest) {
  const ticketId = req.nextUrl.searchParams.get("ticket_id");
  if (!ticketId) {
    return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 });
  }

  try {
    const data = await getAuctionDetail(ticketId);

    if (data.length === 0) {
      return NextResponse.json(data);
    }

    // Merge AWS bids + local bids
    const auction = data[0];
    const localBids = await getLocalBids(ticketId);
    const awsBids = auction.bids || [];
    auction.bids = [...awsBids, ...localBids].sort(
      (a, b) =>
        new Date(a.bid_timestamp).getTime() -
        new Date(b.bid_timestamp).getTime()
    );

    return NextResponse.json([auction]);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

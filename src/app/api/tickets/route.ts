import { NextRequest, NextResponse } from "next/server";
import { getTicketsWithAuctions } from "@/lib/data";

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

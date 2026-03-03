import { NextRequest, NextResponse } from "next/server";
import { searchEvents } from "@/lib/data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const events = await searchEvents(q, undefined, 8);
    return NextResponse.json(
      events.map((e) => ({
        id: e.id,
        name: e.name,
        event_type: e.event_type,
        start_time: e.start_time,
        thumbnail_url: e.thumbnail_url,
      }))
    );
  } catch (err) {
    console.error("Event search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

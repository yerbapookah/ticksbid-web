import { NextRequest, NextResponse } from "next/server";

// POST /api/events/details — fetch event details for an array of IDs (server-side, no CORS)
export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json([]);
    }

    const API_BASE =
      process.env.TICKSBID_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

    const events = await Promise.all(
      ids.map(async (id: string) => {
        try {
          const res = await fetch(`${API_BASE}/events/${id}`, { cache: "no-store" });
          if (res.ok) {
            const ev = await res.json();
            return {
              id: ev.id,
              name: ev.name || "Unknown Event",
              event_type: ev.event_type || "event",
              start_time: ev.start_time || "",
              thumbnail_url: ev.thumbnail_url || null,
            };
          }
        } catch {
          // skip
        }
        return null;
      })
    );

    return NextResponse.json(events.filter(Boolean));
  } catch (err) {
    console.error("Events details error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

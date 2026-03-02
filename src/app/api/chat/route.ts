import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

const SYSTEM_PROMPT = `You are TicksBid AI, a helpful ticket buying assistant for the TicksBid secondary ticket marketplace. You help users find and purchase event tickets.

IMPORTANT SEARCH BEHAVIOR:
- The search API matches against event NAMES only (artist names, team names, show titles). It does NOT understand genres like "rock", "pop", "hip hop", etc.
- When a user asks for a genre or category (e.g. "rock concerts", "comedy shows", "sports"), use the event_type filter (concert, sports, theater, comedy, festival) with an EMPTY query to list all events of that type.
- When a user asks for a specific artist/team (e.g. "Coldplay", "Lakers"), search by that name.
- If one search returns no results, try alternative searches: broader terms, just event_type filter, or list all events.
- Always try at least 2 search strategies before telling the user nothing was found.

You have tools to:
- Search for events by keyword or event_type filter
- View event details and available tickets  
- Place bids on ticket auctions
- Buy tickets instantly at the buy-now price

Always be conversational and helpful. When users describe what they want, search for matching events and present options clearly. Show prices, seat info, and venue details.

When presenting events, include: event name, date, venue, and a link to the event page in the format: /events/{event_id}

When a user wants to buy or bid:
1. First call list_available_tickets to show them what's available with prices
2. Confirm the specific ticket, price, and event before proceeding
3. Ask for explicit confirmation before completing any transaction
4. Never auto-complete a purchase without user approval

Format prices as USD. Keep responses concise but informative.`;

// Tool definitions for Anthropic API
const TOOLS = [
  {
    name: "search_events",
    description: "Search for events. The query matches against event NAMES only (artist, team, show title). For category/genre browsing, use event_type with an empty query string. Always try event_type filter if a keyword search returns no results.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search term matching event names (artist name, team name, show title). Use empty string to list all events of a type." },
        event_type: { type: "string", enum: ["concert", "sports", "theater", "comedy", "festival"], description: "Filter by event type. Use this for genre/category searches like 'rock concerts' or 'comedy shows'." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_event_details",
    description: "Get full details for a specific event including venue info, date/time, and all available tickets with current auction prices.",
    input_schema: {
      type: "object" as const,
      properties: {
        event_id: { type: "string", description: "The event ID to look up" },
      },
      required: ["event_id"],
    },
  },
  {
    name: "list_available_tickets",
    description: "List all available tickets for an event with seat info, current bid prices, and buy-now prices.",
    input_schema: {
      type: "object" as const,
      properties: {
        event_id: { type: "string", description: "The event ID to list tickets for" },
      },
      required: ["event_id"],
    },
  },
  {
    name: "place_bid",
    description: "Place a bid on a ticket auction. Requires user confirmation before executing. Returns the bid result.",
    input_schema: {
      type: "object" as const,
      properties: {
        auction_id: { type: "string", description: "The auction/ticket ID to bid on" },
        bid_amount: { type: "number", description: "The bid amount in USD" },
        bidder_name: { type: "string", description: "Name of the bidder" },
      },
      required: ["auction_id", "bid_amount", "bidder_name"],
    },
  },
  {
    name: "buy_now",
    description: "Purchase a ticket immediately at the buy-now price. Requires explicit user confirmation. Returns a checkout URL.",
    input_schema: {
      type: "object" as const,
      properties: {
        ticket_id: { type: "string", description: "The ticket ID to purchase" },
        event_name: { type: "string", description: "Name of the event" },
        section: { type: "string", description: "Seat section" },
        row: { type: "string", description: "Seat row" },
        seat: { type: "string", description: "Seat number" },
        price: { type: "number", description: "The buy-now price" },
      },
      required: ["ticket_id", "event_name", "section", "row", "seat", "price"],
    },
  },
];

// Execute tool calls against our APIs
async function executeTool(name: string, input: Record<string, unknown>, reqOrigin: string): Promise<string> {
  try {
    switch (name) {
      case "search_events": {
        const params = new URLSearchParams();
        if (input.query) params.set("q", String(input.query));
        if (input.event_type) params.set("event_type", String(input.event_type));
        params.set("limit", "10");
        const res = await fetch(`${API_BASE}/events?${params}`);
        const events = await res.json();
        if (!events.length) return "No events found matching that search.";
        return JSON.stringify(events.map((e: Record<string, unknown>) => ({
          id: e.id,
          name: e.name,
          type: e.event_type,
          date: e.start_time,
          venue_id: e.venue_id,
          thumbnail: e.thumbnail_url,
        })));
      }

      case "get_event_details": {
        const res = await fetch(`${API_BASE}/events/${input.event_id}`);
        if (!res.ok) return "Event not found.";
        const event = await res.json();
        return JSON.stringify({
          id: event.id,
          name: event.name,
          type: event.event_type,
          date: event.start_time,
          venue: event.venue ? { name: event.venue.name, address: event.venue.address, capacity: event.venue.max_capacity } : null,
          thumbnail: event.thumbnail_url,
        });
      }

      case "list_available_tickets": {
        // Fetch from our Vercel Postgres via internal API
        const res = await fetch(`${reqOrigin}/api/tickets?event_id=${input.event_id}`);
        if (!res.ok) {
          // Fallback: get from AWS API event endpoint
          const eventRes = await fetch(`${API_BASE}/events/${input.event_id}`);
          const event = await eventRes.json();
          return JSON.stringify({ event_name: event.name, tickets: event.tickets || [], note: "Ticket details from API" });
        }
        const data = await res.json();
        return JSON.stringify(data);
      }

      case "place_bid": {
        const res = await fetch(`${reqOrigin}/api/bids`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auctionId: input.auction_id,
            bidAmount: input.bid_amount,
            bidderName: input.bidder_name,
          }),
        });
        const result = await res.json();
        if (!res.ok) return `Bid failed: ${result.error || "Unknown error"}`;
        return `Bid placed successfully! $${input.bid_amount} on auction ${input.auction_id}`;
      }

      case "buy_now": {
        const res = await fetch(`${reqOrigin}/api/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId: input.ticket_id,
            eventName: input.event_name,
            section: input.section,
            row: input.row,
            seat: input.seat,
            price: input.price,
          }),
        });
        const result = await res.json();
        if (!res.ok) return `Purchase failed: ${result.error || "Unknown error"}`;
        return JSON.stringify({ success: true, checkout_url: result.url, message: "Checkout session created. User should be redirected to complete payment." });
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err) {
    return `Tool error: ${err instanceof Error ? err.message : "Unknown error"}`;
  }
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { messages } = await req.json();
  const origin = req.nextUrl.origin;

  try {
    // Call Anthropic API
    let response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      }),
    });

    let data = await response.json();

    // Handle tool use loop
    const allMessages = [...messages];
    let iterations = 0;
    const MAX_ITERATIONS = 8;

    while (data.stop_reason === "tool_use" && iterations < MAX_ITERATIONS) {
      iterations++;

      // Add assistant message with tool use
      allMessages.push({ role: "assistant", content: data.content });

      // Execute all tool calls
      const toolResults = [];
      for (const block of data.content) {
        if (block.type === "tool_use") {
          const result = await executeTool(block.name, block.input, origin);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      // Add tool results
      allMessages.push({ role: "user", content: toolResults });

      // Call API again
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          tools: TOOLS,
          messages: allMessages,
        }),
      });

      data = await response.json();
    }

    // Extract final text response
    const textContent = data.content
      ?.filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n") || "I couldn't generate a response.";

    // Check for any checkout URLs in the conversation
    let checkoutUrl = null;
    for (const block of data.content || []) {
      if (block.type === "text" && block.text.includes("checkout_url")) {
        try {
          const match = block.text.match(/"checkout_url":\s*"([^"]+)"/);
          if (match) checkoutUrl = match[1];
        } catch {}
      }
    }

    return NextResponse.json({
      response: textContent,
      checkoutUrl,
    });

  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}

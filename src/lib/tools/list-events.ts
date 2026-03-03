import { searchEvents } from "@/lib/data";
import type { Tool } from "./index";

const listEvents: Tool = {
  definition: {
    name: "list_events",
    description:
      "Search and list events on the TicksBid marketplace. The query matches against event NAMES only — not genres. To browse by category, use event_type with an empty query.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search term matching event names (artist, team, show title). Use empty string to browse by type.",
        },
        event_type: {
          type: "string",
          description:
            "Filter by type: concert, sports, theater, comedy, festival",
        },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
  },

  async execute(input) {
    try {
      const data = await searchEvents(
        (input.query as string) || undefined,
        (input.event_type as string) || undefined,
        (input.limit as number) ?? 20
      );
      if (!data || data.length === 0) return "No events found.";
      return data
        .map(
          (ev) =>
            `[${ev.id}] ${ev.name}\n  Type: ${ev.event_type ?? ""}\n  Date: ${ev.start_time ?? ""}\n  Page: /events/${ev.id}`
        )
        .join("\n\n");
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : e}`;
    }
  },
};

export default listEvents;

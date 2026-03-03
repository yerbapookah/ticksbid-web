import { getEvent } from "@/lib/data";
import type { Tool } from "./index";

const getEventDetails: Tool = {
  definition: {
    name: "get_event_details",
    description: "Get full details for a specific event including venue info.",
    input_schema: {
      type: "object",
      properties: {
        event_id: { type: "string", description: "The event UUID" },
      },
      required: ["event_id"],
    },
  },

  async execute(input) {
    try {
      const ev = await getEvent(String(input.event_id));
      const venue = ev.venue ?? ({} as Record<string, unknown>);
      return [
        `Event: ${ev.name}`,
        `Type: ${ev.event_type ?? ""}`,
        `Date: ${ev.start_time ?? ""}`,
        `Venue: ${venue.name ?? "Unknown"} — ${venue.address ?? ""}`,
        `Capacity: ${venue.max_capacity ?? "N/A"}`,
        `Event page: /events/${ev.id}`,
      ].join("\n");
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : e}`;
    }
  },
};

export default getEventDetails;

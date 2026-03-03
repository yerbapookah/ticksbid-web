/**
 * Tool registry — auto-discovers all tool files in this directory.
 *
 * To add a new tool:
 *   1. Create a new file in src/lib/tools/ (e.g. track-auction.ts)
 *   2. Export a default object matching the Tool interface
 *   3. Import it below and add it to the registry array
 *
 * That's it — the chat route picks it up automatically.
 */

// -- Tool interface ----------------------------------------------------------
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface Tool {
  definition: ToolDefinition;
  execute: (input: Record<string, unknown>) => Promise<string>;
}

// -- Import all tools --------------------------------------------------------
import listEvents from "./list-events";
import getEventDetails from "./get-event-details";
import listTickets from "./list-tickets";
import getAuctionState from "./get-auction-state";
import placeBid from "./place-bid";
import buyNow from "./buy-now";

const registry: Tool[] = [
  listEvents,
  getEventDetails,
  listTickets,
  getAuctionState,
  placeBid,
  buyNow,
];

// -- Exports used by /api/chat -----------------------------------------------

/** Tool definitions in Anthropic format — pass directly to the API */
export const TOOLS = registry.map((t) => t.definition);

/** Execute a tool by name */
export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  const tool = registry.find((t) => t.definition.name === name);
  if (!tool) return `Unknown tool: ${name}`;
  return tool.execute(input);
}

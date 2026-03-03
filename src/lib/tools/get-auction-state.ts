import { getAuctionState as fetchAuctionState } from "@/lib/data";
import type { Tool } from "./index";

const getAuctionState: Tool = {
  definition: {
    name: "get_auction_state",
    description:
      "Get the live auction state for a specific ticket — status, current bid, prices, time remaining.",
    input_schema: {
      type: "object",
      properties: {
        ticket_id: { type: "string", description: "The ticket/auction UUID" },
      },
      required: ["ticket_id"],
    },
  },

  async execute(input) {
    const state = await fetchAuctionState(String(input.ticket_id));
    if (!state) return "Auction not found.";
    return [
      `Auction for ticket ${input.ticket_id}:`,
      `  Status: ${state.auction_status ?? "N/A"}`,
      `  Current Bid: $${Number(state.highest_bid ?? 0).toFixed(2)}`,
      `  Reserve Price: $${Number(state.reserve_price ?? 0).toFixed(2)}`,
      `  Buy Now Price: $${Number(state.buy_it_now_price ?? 0).toFixed(2)}`,
      `  Auction Ends: ${state.end_time ?? "N/A"}`,
    ].join("\n");
  },
};

export default getAuctionState;

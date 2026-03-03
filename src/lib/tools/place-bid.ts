import {
  getAuctionState,
  placeBid as dbPlaceBid,
} from "@/lib/data";
import type { Tool } from "./index";

const placeBid: Tool = {
  definition: {
    name: "place_bid",
    description:
      "Place a bid on a ticket auction. IMPORTANT: Always confirm the ticket, amount, and event with the user before calling this.",
    input_schema: {
      type: "object",
      properties: {
        ticket_id: {
          type: "string",
          description: "The ticket/auction UUID to bid on",
        },
        bid_amount: { type: "number", description: "The bid amount in USD" },
        bidder_name: { type: "string", description: "Name of the bidder" },
      },
      required: ["ticket_id", "bid_amount", "bidder_name"],
    },
  },

  async execute(input) {
    const ticketId = String(input.ticket_id);
    const bidAmount = Number(input.bid_amount);
    const bidderName = String(input.bidder_name);

    const state = await getAuctionState(ticketId);
    if (!state)
      return "Error: Could not verify auction state. The auction may not exist.";
    if (state.auction_status !== "OPEN")
      return `Error: Auction is not open (status: ${state.auction_status})`;

    const currentHighest = Number(state.highest_bid ?? 0);
    const buyNow = Number(state.buy_it_now_price ?? 0);

    if (bidAmount <= currentHighest)
      return `Error: Bid of $${bidAmount.toFixed(2)} must be higher than current bid of $${currentHighest.toFixed(2)}`;
    if (buyNow && bidAmount >= buyNow)
      return `Error: Bid of $${bidAmount.toFixed(2)} exceeds buy-now price of $${buyNow.toFixed(2)}. Use buy_now instead.`;

    try {
      const bid = await dbPlaceBid(ticketId, bidAmount, bidderName);
      return [
        "Bid placed successfully!",
        `  Bid ID: ${bid.id}`,
        `  Amount: $${bid.bid_amount.toFixed(2)}`,
        `  Previous highest: $${currentHighest.toFixed(2)}`,
        `  Buy-now price: $${buyNow.toFixed(2)}`,
      ].join("\n");
    } catch (e) {
      return `Error placing bid: ${e instanceof Error ? e.message : e}`;
    }
  },
};

export default placeBid;

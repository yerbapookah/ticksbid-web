import { getAuctionState } from "@/lib/data";
import { getStripe } from "@/lib/stripe";
import type { Tool } from "./index";

const buyNow: Tool = {
  definition: {
    name: "buy_now",
    description:
      "Purchase a ticket instantly at the buy-now price. IMPORTANT: Always confirm the exact ticket, price, and event with the user before calling this. Returns a Stripe checkout URL.",
    input_schema: {
      type: "object",
      properties: {
        ticket_id: { type: "string", description: "The ticket UUID" },
        event_name: {
          type: "string",
          description: "Name of the event (for checkout display)",
        },
        section: { type: "string", description: "Seat section" },
        row: { type: "string", description: "Seat row" },
        seat: { type: "string", description: "Seat number" },
        price: { type: "number", description: "The buy-now price in USD" },
      },
      required: ["ticket_id", "event_name", "section", "row", "seat", "price"],
    },
  },

  async execute(input) {
    const ticketId = String(input.ticket_id);
    const eventName = String(input.event_name);
    const section = String(input.section);
    const row = String(input.row);
    const seat = String(input.seat);
    const price = Number(input.price);

    const state = await getAuctionState(ticketId);
    if (!state) return "Error: Could not verify auction state.";
    if (state.auction_status !== "OPEN")
      return `Error: Auction is not open (status: ${state.auction_status})`;

    const actualPrice = Number(state.buy_it_now_price ?? 0);
    if (Math.abs(price - actualPrice) > 0.01)
      return `Error: Price mismatch. You specified $${price.toFixed(2)} but the buy-now price is $${actualPrice.toFixed(2)}.`;

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${eventName} — Sec ${section} Row ${row} Seat ${seat}`,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        metadata: { ticketId },
        success_url:
          "https://ticksbid-web.vercel.app/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://ticksbid-web.vercel.app/checkout/cancel",
      });

      return [
        "Purchase ready!",
        `  Event: ${eventName}`,
        `  Seat: Section ${section}, Row ${row}, Seat ${seat}`,
        `  Price: $${price.toFixed(2)}`,
        `  Complete payment here: ${session.url}`,
      ].join("\n");
    } catch (e) {
      return `Error creating checkout: ${e instanceof Error ? e.message : e}`;
    }
  },
};

export default buyNow;

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { ticketId, eventName, section, row, seat, price } = await req.json();

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const amountCents = Math.round(price * 100);

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: eventName || "Event Ticket",
              description: `Section ${section || "—"} · Row ${row || "—"} · Seat ${seat || "—"}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        ticketId: ticketId || "",
        eventName: eventName || "",
      },
      // TODO: When sellers have Stripe Connect accounts, add:
      // payment_intent_data: {
      //   application_fee_amount: Math.round(amountCents * feeRate),
      //   transfer_data: { destination: sellerStripeAccountId },
      // },
      success_url: `${req.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

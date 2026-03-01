import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Create a Stripe Connect Express account for a seller and return the onboarding link
export async function POST(req: NextRequest) {
  try {
    const { email, username } = await req.json();

    // Create Connected Express account
    const account = await getStripe().accounts.create({
      type: "express",
      ...(email ? { email } : {}),
      metadata: { username: username || "" },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Generate onboarding link
    const accountLink = await getStripe().accountLinks.create({
      account: account.id,
      refresh_url: `${req.nextUrl.origin}/sell?stripe_refresh=true`,
      return_url: `${req.nextUrl.origin}/sell?stripe_connected=true&account_id=${account.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      accountId: account.id,
      url: accountLink.url,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Connect setup failed";
    console.error("Stripe Connect error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

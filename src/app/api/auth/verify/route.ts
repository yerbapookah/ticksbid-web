import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
    }

    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: `+1${phone}`,
        code,
      });

    if (check.status === "approved") {
      // TODO: Look up user in database by phone number
      // If found → return { verified: true, isNewUser: false }
      // If not found → return { verified: true, isNewUser: true }
      // For now, always treat as new user
      return NextResponse.json({ verified: true, isNewUser: true });
    }

    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("Twilio verify error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

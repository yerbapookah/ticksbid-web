import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Ensure the offers table exists
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS timed_offers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      ticket_id UUID NOT NULL,
      auction_id UUID,
      offer_amount DECIMAL(10,2) NOT NULL,
      bidder_name VARCHAR(100) DEFAULT 'Anonymous',
      status VARCHAR(20) DEFAULT 'pending',
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      resolved_at TIMESTAMPTZ
    )
  `;
}

// POST /api/offers — create a timed offer
export async function POST(req: NextRequest) {
  try {
    await ensureTable();

    const body = await req.json();
    const { ticket_id, auction_id, offer_amount, bidder_name, duration_hours } = body;

    if (!ticket_id || !offer_amount || !duration_hours) {
      return NextResponse.json({ error: "ticket_id, offer_amount, and duration_hours are required" }, { status: 400 });
    }

    const amount = parseFloat(offer_amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid offer amount" }, { status: 400 });
    }

    const hours = parseFloat(duration_hours);
    if (isNaN(hours) || hours < 1) {
      return NextResponse.json({ error: "Minimum offer duration is 1 hour" }, { status: 400 });
    }

    // Check auction end time — can't place offer if less than 1 hour left
    if (auction_id) {
      // Check local auction states first
      const { rows: localAuction } = await sql`
        SELECT end_time FROM auction_states_local WHERE ticket_id = ${ticket_id}
      `;

      let auctionEndTime: Date | null = null;
      if (localAuction.length > 0 && localAuction[0].end_time) {
        auctionEndTime = new Date(localAuction[0].end_time);
      }

      if (auctionEndTime) {
        const timeLeft = auctionEndTime.getTime() - Date.now();
        if (timeLeft < 60 * 60 * 1000) {
          return NextResponse.json({ error: "Cannot place offers with less than 1 hour left in auction" }, { status: 400 });
        }

        // Cap offer expiry at auction end time
        const requestedExpiry = new Date(Date.now() + hours * 60 * 60 * 1000);
        if (requestedExpiry > auctionEndTime) {
          // Silently cap at auction end
          const cappedHours = (auctionEndTime.getTime() - Date.now()) / (60 * 60 * 1000);
          if (cappedHours < 1) {
            return NextResponse.json({ error: "Not enough time left to place this offer" }, { status: 400 });
          }
        }
      }
    }

    // Check no existing pending offer from this bidder on this ticket
    const { rows: existing } = await sql`
      SELECT id FROM timed_offers
      WHERE ticket_id = ${ticket_id} AND bidder_name = ${bidder_name || "Anonymous"} AND status = 'pending' AND expires_at > NOW()
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "You already have a pending offer on this ticket" }, { status: 400 });
    }

    // Compute expiry, capped at auction end if applicable
    let expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Re-check auction end to cap
    if (auction_id) {
      const { rows: localAuction } = await sql`
        SELECT end_time FROM auction_states_local WHERE ticket_id = ${ticket_id}
      `;
      if (localAuction.length > 0 && localAuction[0].end_time) {
        const auctionEnd = new Date(localAuction[0].end_time);
        if (expiresAt > auctionEnd) {
          expiresAt = auctionEnd;
        }
      }
    }

    const { rows } = await sql`
      INSERT INTO timed_offers (ticket_id, auction_id, offer_amount, bidder_name, expires_at)
      VALUES (${ticket_id}, ${auction_id || null}, ${amount}, ${bidder_name || "Anonymous"}, ${expiresAt.toISOString()})
      RETURNING *
    `;

    return NextResponse.json({ offer: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Create offer error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// GET /api/offers?ticket_id=X — list offers for a ticket
export async function GET(req: NextRequest) {
  try {
    await ensureTable();

    const ticketId = req.nextUrl.searchParams.get("ticket_id");
    if (!ticketId) {
      // Return all pending offers (for seller dashboard)
      const { rows } = await sql`
        SELECT * FROM timed_offers
        WHERE status = 'pending' AND expires_at > NOW()
        ORDER BY offer_amount DESC
      `;
      return NextResponse.json(rows);
    }

    const { rows } = await sql`
      SELECT * FROM timed_offers
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Get offers error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// PATCH /api/offers — accept or reject an offer
export async function PATCH(req: NextRequest) {
  try {
    await ensureTable();

    const { offer_id, action } = await req.json();
    if (!offer_id || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "offer_id and action (accept/reject) required" }, { status: 400 });
    }

    // Get the offer
    const { rows: offers } = await sql`
      SELECT * FROM timed_offers WHERE id = ${offer_id}
    `;
    if (offers.length === 0) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const offer = offers[0];

    if (offer.status !== "pending") {
      return NextResponse.json({ error: `Offer already ${offer.status}` }, { status: 400 });
    }

    if (new Date(offer.expires_at) < new Date()) {
      // Auto-expire
      await sql`UPDATE timed_offers SET status = 'expired', resolved_at = NOW() WHERE id = ${offer_id}`;
      return NextResponse.json({ error: "Offer has expired" }, { status: 400 });
    }

    if (action === "accept") {
      // Mark offer as accepted
      await sql`UPDATE timed_offers SET status = 'accepted', resolved_at = NOW() WHERE id = ${offer_id}`;

      // Close the auction — update local auction state
      await sql`
        UPDATE auction_states_local SET auction_status = 'sold' WHERE ticket_id = ${offer.ticket_id}
      `;

      // Reject all other pending offers on this ticket
      await sql`
        UPDATE timed_offers SET status = 'rejected', resolved_at = NOW()
        WHERE ticket_id = ${offer.ticket_id} AND id != ${offer_id} AND status = 'pending'
      `;

      return NextResponse.json({ message: "Offer accepted, auction closed", offer: { ...offer, status: "accepted" } });
    } else {
      await sql`UPDATE timed_offers SET status = 'rejected', resolved_at = NOW() WHERE id = ${offer_id}`;
      return NextResponse.json({ message: "Offer rejected", offer: { ...offer, status: "rejected" } });
    }
  } catch (err) {
    console.error("Update offer error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

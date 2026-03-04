"use client";

import { useState } from "react";
import { getMinBid, getMinIncrement } from "@/lib/bidding";
import Countdown from "@/components/AuctionCountdown";
import AuctionDetailPanel from "@/components/AuctionDetailPanel";

interface AuctionTicketCardProps {
  ticketId: string;
  section: string;
  row: string;
  seat: string;
  ticketType?: string;
  eventName: string;
  auctionId?: string;
  buyItNowPrice?: number;
  currentBid?: number | null;
  auctionStatus?: string;
  auctionEndTime?: string;
  expired?: boolean;
  selected?: boolean;
  onSelect?: (ticketId: string) => void;
}

type CardMode = "bid" | "offer";

const OFFER_DURATIONS = [
  { label: "1 hour", value: 1 },
  { label: "2 hours", value: 2 },
  { label: "4 hours", value: 4 },
  { label: "8 hours", value: 8 },
  { label: "12 hours", value: 12 },
  { label: "24 hours", value: 24 },
];

export default function AuctionTicketCard({
  ticketId,
  section,
  row,
  seat,
  ticketType,
  eventName,
  auctionId,
  buyItNowPrice,
  currentBid,
  auctionStatus,
  auctionEndTime,
  expired,
  selected,
  onSelect,
}: AuctionTicketCardProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [bidLoading, setBidLoading] = useState(false);
  const [bidInput, setBidInput] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [liveBid, setLiveBid] = useState(currentBid ?? 0);
  const [expanded, setExpanded] = useState(false);

  // Offer state
  const [mode, setMode] = useState<CardMode>("bid");
  const [offerAmount, setOfferAmount] = useState("");
  const [offerDuration, setOfferDuration] = useState(4);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [offerSuccess, setOfferSuccess] = useState("");

  const hasBids = liveBid > 0;
  const displayBid = liveBid;

  // Check if less than 1 hour left in auction
  const auctionTimeLeft = auctionEndTime
    ? new Date(auctionEndTime).getTime() - Date.now()
    : Infinity;
  const canOffer = auctionTimeLeft > 60 * 60 * 1000;

  async function handleBuyNow() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          eventName,
          section,
          row,
          seat,
          price: buyItNowPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutLoading(false);
    }
  }

  async function handlePlaceBid() {
    setBidError("");
    setBidSuccess("");

    const amount = parseFloat(bidInput);
    if (isNaN(amount) || amount <= 0) {
      setBidError("Enter a valid amount");
      return;
    }
    const minBid = getMinBid(displayBid);
    if (amount < minBid) {
      setBidError(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }
    if (buyItNowPrice && amount >= buyItNowPrice) {
      setBidError(`Must be less than Buy Now ($${buyItNowPrice.toFixed(2)})`);
      return;
    }

    setBidLoading(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId,
          bidAmount: amount,
          bidderName: "You",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBidError(data.error || "Failed to place bid");
      } else {
        setLiveBid(data.bid.bid_amount);
        setBidInput("");
        setBidSuccess("Bid placed!");
        setTimeout(() => setBidSuccess(""), 3000);
      }
    } catch {
      setBidError("Failed to place bid");
    } finally {
      setBidLoading(false);
    }
  }

  async function handlePlaceOffer() {
    setOfferError("");
    setOfferSuccess("");

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      setOfferError("Enter a valid amount");
      return;
    }
    if (buyItNowPrice && amount >= buyItNowPrice) {
      setOfferError(`Must be less than Buy Now ($${buyItNowPrice.toFixed(2)})`);
      return;
    }

    setOfferLoading(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketId,
          auction_id: auctionId,
          offer_amount: amount,
          duration_hours: offerDuration,
          bidder_name: "You",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOfferError(data.error || "Failed to place offer");
      } else {
        setOfferAmount("");
        setOfferSuccess(`Offer of $${amount.toFixed(2)} sent — valid for ${offerDuration}h`);
        setTimeout(() => setOfferSuccess(""), 5000);
      }
    } catch {
      setOfferError("Failed to place offer");
    } finally {
      setOfferLoading(false);
    }
  }

  return (
    <div
      className={`rounded-xl border bg-[var(--bg-secondary)] p-3 sm:p-4 transition-all ${
        selected
          ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30"
          : expanded
          ? "border-[var(--accent)]/40"
          : "border-[var(--border)] hover:border-[var(--border-hover)]"
      }`}
    >
      {/* Clickable area */}
      <div
        className="cursor-pointer"
        onClick={() => {
          setExpanded(!expanded);
          onSelect?.(ticketId);
        }}
      >
        {/* Row 1: Seat info + current bid */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Section {section} · Row {row} · Seat {seat}
            </p>
            {ticketType && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{ticketType}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
              {hasBids ? "Current bid" : "No bids"}
            </p>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              ${displayBid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Row 2: Countdown + Buy Now (aligned on desktop) */}
        {(auctionEndTime || (buyItNowPrice && !expired)) && (
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              {auctionEndTime && (
                <Countdown endTime={auctionEndTime} label="Auction ends in" compact />
              )}
            </div>
            {/* Buy Now — desktop: inline right-aligned */}
            {buyItNowPrice && !expired && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow();
                }}
                disabled={checkoutLoading}
                className="hidden sm:block flex-shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <svg className="h-4 w-4 animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  `Buy Now · $${buyItNowPrice.toFixed(2)}`
                )}
              </button>
            )}
          </div>
        )}

        {/* Buy Now — mobile: full width */}
        {buyItNowPrice && !expired && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow();
            }}
            disabled={checkoutLoading}
            className="mt-3 w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-50 sm:hidden"
          >
            {checkoutLoading ? (
              <svg className="h-4 w-4 animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              `Buy Now · $${buyItNowPrice.toFixed(2)}`
            )}
          </button>
        )}
      </div>

      {/* Mode toggle + input area */}
      {auctionId && !expired && (
        <div
          className="mt-3 border-t border-[var(--border)] pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bid / Offer toggle */}
          <div className="flex items-center gap-1 mb-3 rounded-lg bg-[var(--bg-card)] p-0.5 border border-[var(--border)]">
            <button
              onClick={() => { setMode("bid"); setOfferError(""); setOfferSuccess(""); }}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                mode === "bid"
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Place Bid
            </button>
            <button
              onClick={() => { setMode("offer"); setBidError(""); setBidSuccess(""); }}
              disabled={!canOffer}
              title={!canOffer ? "Less than 1 hour left in auction" : "Make a timed offer to the seller"}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                mode === "offer"
                  ? "bg-[var(--amber)]/15 text-[var(--amber)] shadow-sm"
                  : !canOffer
                  ? "text-[var(--text-muted)]/40 cursor-not-allowed"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Make Offer
            </button>
          </div>

          {/* Bid mode */}
          {mode === "bid" && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                  className="text-sm font-medium text-[var(--text-muted)] pointer-events-none select-none"
                >
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={bidInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                      setBidInput(val);
                      setBidError("");
                      setBidSuccess("");
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePlaceBid()}
                  placeholder={`Min ${getMinBid(displayBid).toFixed(2)}`}
                  style={{ paddingLeft: "28px" }}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] py-2 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <button
                onClick={handlePlaceBid}
                disabled={bidLoading || !bidInput}
                className="flex-shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                {bidLoading ? "..." : "Place Bid"}
              </button>
            </div>
          )}

          {/* Offer mode */}
          {mode === "offer" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <span
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                    className="text-sm font-medium text-[var(--text-muted)] pointer-events-none select-none"
                  >
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={offerAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                        setOfferAmount(val);
                        setOfferError("");
                        setOfferSuccess("");
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handlePlaceOffer()}
                    placeholder="Your offer"
                    style={{ paddingLeft: "28px" }}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] py-2 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--amber)]/60 focus:outline-none"
                  />
                </div>
                <select
                  value={offerDuration}
                  onChange={(e) => setOfferDuration(Number(e.target.value))}
                  className="flex-shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2 py-2 text-xs text-[var(--text-secondary)] focus:border-[var(--amber)]/60 focus:outline-none"
                >
                  {OFFER_DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlaceOffer}
                  disabled={offerLoading || !offerAmount}
                  className="flex-1 rounded-lg bg-[var(--amber)] px-4 py-2 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {offerLoading ? "Sending..." : "Send Offer"}
                </button>
              </div>
              <p className="mt-1.5 text-[0.6rem] text-[var(--text-muted)]">
                The seller has {offerDuration}h to accept. If they don&apos;t respond, the offer expires automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {bidError && <p className="mt-2 text-xs text-red-500">{bidError}</p>}
      {bidSuccess && <p className="mt-2 text-xs text-[var(--green)]">{bidSuccess}</p>}
      {offerError && <p className="mt-2 text-xs text-red-500">{offerError}</p>}
      {offerSuccess && <p className="mt-2 text-xs text-[var(--amber)]">{offerSuccess}</p>}

      {/* Expandable detail panel */}
      {expanded && (
        <div className="mt-3 border-t border-[var(--border)] pt-1">
          <AuctionDetailPanel
            ticketId={ticketId}
            reservePrice={undefined}
            buyItNowPrice={buyItNowPrice}
          />
        </div>
      )}
    </div>
  );
}

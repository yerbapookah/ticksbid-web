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

  const hasBids = liveBid > 0;
  const displayBid = liveBid;

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
        {/* Row 1: Seat info + current bid / buy now */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Section {section} · Row {row} · Seat {seat}
            </p>
            {ticketType && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{ticketType}</p>
            )}
            {/* Countdown below seat info */}
            {auctionEndTime && (
              <div className="mt-2">
                <Countdown endTime={auctionEndTime} label="Auction ends in" compact />
              </div>
            )}
            {/* Buy Now — full width on mobile only */}
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
                  `Buy Now · ${buyItNowPrice.toFixed(2)}`
                )}
              </button>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
              {hasBids ? "Current bid" : "No bids"}
            </p>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              ${displayBid.toFixed(2)}
            </p>
            {/* Buy Now — desktop: sits right under current bid */}
            {buyItNowPrice && !expired && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow();
                }}
                disabled={checkoutLoading}
                className="hidden sm:block mt-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <svg className="h-4 w-4 animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  `Buy Now · ${buyItNowPrice.toFixed(2)}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bid input row */}
      {auctionId && !expired && (
        <div
          className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex-1">
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
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

      {/* Feedback */}
      {bidError && <p className="mt-2 text-xs text-red-500">{bidError}</p>}
      {bidSuccess && (
        <p className="mt-2 text-xs text-[var(--green)]">{bidSuccess}</p>
      )}

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

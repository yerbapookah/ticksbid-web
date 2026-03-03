"use client";

import { useState, useEffect, useRef } from "react";

interface EventResult {
  id: string;
  name: string;
  event_type: string;
  start_time: string;
  thumbnail_url?: string;
}

type AuctionEnd = "max" | "1d" | "3d" | "7d" | "14d" | "30d";

interface ListingData {
  event: EventResult | null;
  section: string;
  row: string;
  seat: string;
  ticketType: string;
  reservePrice: string;
  buyNowPrice: string;
  auctionEnd: AuctionEnd;
}

const INITIAL: ListingData = {
  event: null,
  section: "",
  row: "",
  seat: "",
  ticketType: "",
  reservePrice: "",
  buyNowPrice: "",
  auctionEnd: "max",
};

const AUCTION_END_LABELS: Record<AuctionEnd, string> = {
  "1d": "1 day",
  "3d": "3 days",
  "7d": "7 days",
  "14d": "2 weeks",
  "30d": "30 days",
  "max": "Up to event",
};

function computeEndTime(auctionEnd: AuctionEnd, eventStartTime: string): string {
  const maxEnd = new Date(new Date(eventStartTime).getTime() - 2 * 60 * 60 * 1000);
  if (auctionEnd === "max") return maxEnd.toISOString();

  const daysMap: Record<string, number> = { "1d": 1, "3d": 3, "7d": 7, "14d": 14, "30d": 30 };
  const days = daysMap[auctionEnd] || 7;
  const fromNow = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // Cap at 2hrs before event
  return fromNow < maxEnd ? fromNow.toISOString() : maxEnd.toISOString();
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i < current ? "bg-[var(--accent)]" : i === current ? "bg-[var(--accent)]/50" : "bg-[var(--border)]"
          }`}
        />
      ))}
    </div>
  );
}

function EventSearch({
  selected,
  onSelect,
}: {
  selected: EventResult | null;
  onSelect: (e: EventResult | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{selected.name}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {selected.event_type} · {new Date(selected.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="flex-shrink-0 rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for an event…"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] pl-10 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
        />
        {loading && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {open && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl shadow-black/60">
            {results.map((event) => (
              <button
                key={event.id}
                onClick={() => {
                  onSelect(event);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
              >
                {event.thumbnail_url && (
                  <img
                    src={event.thumbnail_url}
                    alt=""
                    className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{event.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {event.event_type} · {new Date(event.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {open && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center text-sm text-[var(--text-muted)] shadow-xl">
          No events found
        </div>
      )}
    </div>
  );
}

export default function SellerPanel() {
  const [step, setStep] = useState(0); // 0=event, 1=seat, 2=pricing, 3=review
  const [data, setData] = useState<ListingData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(partial: Partial<ListingData>) {
    setData((prev) => ({ ...prev, ...partial }));
    setError("");
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return !!data.event;
      case 1: return !!data.section && !!data.row && !!data.seat;
      case 2: return true; // reserve and buy-now are both optional
      default: return true;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const reservePrice = data.reservePrice ? parseFloat(data.reservePrice) : null;
    const buyNowPrice = data.buyNowPrice ? parseFloat(data.buyNowPrice) : null;

    if (reservePrice !== null && buyNowPrice !== null && buyNowPrice <= reservePrice) {
      setError("Buy Now price must be higher than reserve price");
      setSubmitting(false);
      return;
    }

    try {
      const endTime = computeEndTime(data.auctionEnd, data.event!.start_time);

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: data.event!.id,
          seat_section: data.section,
          seat_row: data.row,
          seat_number: data.seat,
          ticket_type: data.ticketType || null,
          reserve_price: reservePrice,
          buy_it_now_price: buyNowPrice,
          auction_end_time: endTime,
          seller_name: "Seller",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list ticket");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setData(INITIAL);
    setStep(0);
    setSuccess(false);
    setError("");
  }

  // Success state
  if (success) {
    return (
      <div className="sticky top-24 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--green)]/15 border border-[var(--green)]/20">
            <svg className="h-7 w-7 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Ticket Listed!</h2>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            Section {data.section} · Row {data.row} · Seat {data.seat}
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            Your auction is live{data.event?.start_time ? ` until ${new Date(computeEndTime(data.auctionEnd, data.event.start_time)).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : ""}.
            {data.reservePrice ? ` Reserve: ${parseFloat(data.reservePrice).toFixed(2)}.` : " No reserve — bidding starts at $0."}
            {data.buyNowPrice ? ` Buy now: ${parseFloat(data.buyNowPrice).toFixed(2)}.` : ""}
          </p>
          <button
            onClick={resetForm}
            className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)]"
          >
            List Another Ticket
          </button>
          <a
            href={`/events/${data.event?.id}`}
            className="mt-3 block w-full rounded-xl border border-[var(--border)] py-3 text-center text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          >
            View Event
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">List a Ticket</h2>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Set your price and let buyers bid or buy instantly.
      </p>

      <StepIndicator current={step} total={4} />

      {/* Step 0: Select Event */}
      {step === 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Event
          </label>
          <EventSearch
            selected={data.event}
            onSelect={(e) => update({ event: e })}
          />
          <p className="mt-2 text-[0.65rem] text-[var(--text-muted)]">
            Search for the event your ticket is for.
          </p>
        </div>
      )}

      {/* Step 1: Seat Details */}
      {step === 1 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Seat Details
          </label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">Section</label>
              <input
                type="text"
                value={data.section}
                onChange={(e) => update({ section: e.target.value })}
                placeholder="101"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">Row</label>
              <input
                type="text"
                value={data.row}
                onChange={(e) => update({ row: e.target.value })}
                placeholder="A"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">Seat</label>
              <input
                type="text"
                value={data.seat}
                onChange={(e) => update({ seat: e.target.value })}
                placeholder="12"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">Ticket Type</label>
            <select
              value={data.ticketType}
              onChange={(e) => update({ ticketType: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/40"
            >
              <option value="">Standard</option>
              <option value="floor">Floor</option>
              <option value="ga">General Admission</option>
              <option value="vip">VIP</option>
              <option value="box">Box / Suite</option>
              <option value="accessible">Accessible</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Pricing */}
      {step === 2 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Pricing
          </label>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                Reserve Price <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--text-muted)]">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={data.reservePrice}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) update({ reservePrice: v });
                  }}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] pl-7 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
                />
              </div>
              <p className="mt-1 text-[0.65rem] text-[var(--text-muted)]">Minimum price to sell. Leave blank to start bidding at $0 with no reserve.</p>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                Buy Now Price <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--text-muted)]">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={data.buyNowPrice}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) update({ buyNowPrice: v });
                  }}
                  placeholder="150.00"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] pl-7 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
                />
              </div>
              <p className="mt-1 text-[0.65rem] text-[var(--text-muted)]">Buyers can skip the auction and pay this price instantly.</p>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                Auction Ends
              </label>
              <select
                value={data.auctionEnd}
                onChange={(e) => update({ auctionEnd: e.target.value as AuctionEnd })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/40"
              >
                {(Object.keys(AUCTION_END_LABELS) as AuctionEnd[]).map((key) => (
                  <option key={key} value={key}>{AUCTION_END_LABELS[key]}</option>
                ))}
              </select>
              {data.event?.start_time && (
                <p className="mt-1 text-[0.65rem] text-[var(--text-muted)]">
                  Closes {new Date(computeEndTime(data.auctionEnd, data.event.start_time)).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
                  })}
                  {data.auctionEnd !== "max" && " (capped at 2hrs before event)"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div>
          <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Review Listing
          </label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] divide-y divide-[var(--border)]">
            <div className="px-4 py-3">
              <p className="text-xs text-[var(--text-muted)]">Event</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{data.event?.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {data.event?.start_time && new Date(data.event.start_time).toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-[var(--text-muted)]">Seat</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Section {data.section} · Row {data.row} · Seat {data.seat}
                {data.ticketType ? ` · ${data.ticketType.toUpperCase()}` : ""}
              </p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Reserve</p>
                <p className="text-lg font-bold text-[var(--green)]">
                  {data.reservePrice ? `${parseFloat(data.reservePrice).toFixed(2)}` : "No reserve"}
                </p>
              </div>
              {data.buyNowPrice && (
                <div className="text-right">
                  <p className="text-xs text-[var(--text-muted)]">Buy Now</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">${parseFloat(data.buyNowPrice).toFixed(2)}</p>
                </div>
              )}
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-[var(--text-muted)]">Auction Ends</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {data.event?.start_time
                  ? new Date(computeEndTime(data.auctionEnd, data.event.start_time)).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
                    })
                  : "—"}
              </p>
              <p className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">
                {data.auctionEnd === "max" ? "Maximum — 2hrs before event" : `${AUCTION_END_LABELS[data.auctionEnd]} from now`}
              </p>
            </div>
          </div>

          {/* Fee estimate */}
          {data.buyNowPrice && (
            <div className="mt-3 rounded-lg bg-[var(--bg-secondary)] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Est. seller fee (8%)</span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  -${(parseFloat(data.buyNowPrice) * 0.08).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[var(--text-muted)]">Est. payout at Buy Now</span>
                <span className="text-xs font-semibold text-[var(--green)]">
                  ${(parseFloat(data.buyNowPrice) * 0.92).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      {/* Navigation buttons */}
      <div className="mt-5 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex-1 rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-[var(--green)] py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Listing…
              </span>
            ) : (
              "List Ticket"
            )}
          </button>
        )}
      </div>

      {/* Agent API callout */}
      <div className="mt-6 rounded-lg bg-[var(--bg-secondary)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Seller API
          </span>
        </div>
        <code className="text-xs text-[var(--text-muted)]">POST /api/tickets</code>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          List tickets programmatically. Send event_id, seat details, and pricing.
        </p>
      </div>
    </div>
  );
}

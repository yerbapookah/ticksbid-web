"use client";

import { useState } from "react";

export default function TestCheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTestBuy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: "test-ticket-001",
          eventName: "Taylor Swift – Eras Tour",
          section: "Floor A",
          row: "12",
          seat: "5",
          price: 150,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--accent)]">
          Test Mode
        </div>
        <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Stripe Checkout Test</h1>

        {/* Mock ticket */}
        <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Taylor Swift – Eras Tour</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Floor A · Row 12 · Seat 5</p>
          <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">$150.00</p>
          <p className="text-xs text-[var(--green)]">Zero buyer fees</p>
        </div>

        {error && <p className="mb-4 text-xs text-[var(--red)]">{error}</p>}

        <button
          onClick={handleTestBuy}
          disabled={loading}
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redirecting to Stripe…
            </span>
          ) : "Buy Now — $150.00"}
        </button>

        <div className="mt-6 rounded-lg bg-[var(--bg-secondary)] p-4 text-xs text-[var(--text-muted)] leading-relaxed">
          <p className="font-semibold text-[var(--text-secondary)] mb-2">Test card details:</p>
          <p>Card: 4242 4242 4242 4242</p>
          <p>Expiry: 12/26</p>
          <p>CVC: 123</p>
          <p>Name/ZIP: anything</p>
        </div>
      </div>
    </div>
  );
}

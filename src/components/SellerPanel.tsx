"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

type SellerStatus = "not_logged_in" | "needs_stripe" | "connecting" | "connected";

export default function SellerPanel() {
  const { isLoggedIn, user } = useAuth();

  // Check localStorage for saved Stripe account
  const savedAccountId = typeof window !== "undefined"
    ? localStorage.getItem("ticksbid_stripe_account") : null;

  const [status, setStatus] = useState<SellerStatus>(
    !isLoggedIn ? "not_logged_in" : savedAccountId ? "connected" : "needs_stripe"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Listing form state
  const [eventSearch, setEventSearch] = useState("");
  const [section, setSection] = useState("");
  const [row, setRow] = useState("");
  const [seat, setSeat] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [listSuccess, setListSuccess] = useState(false);

  async function handleConnectStripe() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "", // Will be collected by Stripe
          username: user?.username || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Save account ID before redirecting
      localStorage.setItem("ticksbid_stripe_account", data.accountId);
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start onboarding");
      setLoading(false);
    }
  }

  async function handleListTicket() {
    if (!section || !row || !seat) {
      setError("Please fill in section, row, and seat");
      return;
    }
    setLoading(true);
    setError("");
    setListSuccess(false);
    try {
      // TODO: Replace with real event ID from search
      // For now just show success state
      await new Promise((r) => setTimeout(r, 800));
      setListSuccess(true);
      setSection("");
      setRow("");
      setSeat("");
      setTicketType("");
      setEventSearch("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to list ticket");
    } finally {
      setLoading(false);
    }
  }

  // Check URL params for Stripe Connect return
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe_connected") === "true" && status !== "connected") {
      const accountId = params.get("account_id");
      if (accountId) localStorage.setItem("ticksbid_stripe_account", accountId);
      setStatus("connected");
    }
  }

  return (
    <div className="sticky top-24 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      {/* Not logged in */}
      {status === "not_logged_in" && (
        <>
          <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">Start Selling</h2>
          <p className="mb-6 text-xs text-[var(--text-muted)]">
            Sign in to list tickets. Or use the API to list programmatically.
          </p>
          <Link
            href="/login"
            className="mb-3 block w-full rounded-xl bg-[var(--accent)] py-3 text-center text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)]"
          >
            Log in to sell
          </Link>
          <Link
            href="/"
            className="block w-full rounded-xl border border-[var(--border)] py-3 text-center text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          >
            Browse Events
          </Link>
        </>
      )}

      {/* Logged in but no Stripe */}
      {status === "needs_stripe" && (
        <>
          <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">Connect Payouts</h2>
          <p className="mb-5 text-xs text-[var(--text-muted)]">
            Connect your Stripe account to receive payouts when your tickets sell. This takes about 2 minutes.
          </p>

          <div className="mb-5 rounded-lg bg-[var(--bg-secondary)] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#635BFF]/15">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#635BFF">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">Powered by Stripe</p>
                <p className="mt-0.5 text-[0.65rem] text-[var(--text-muted)] leading-relaxed">
                  Secure identity verification, bank account setup, and tax compliance — all handled by Stripe.
                </p>
              </div>
            </div>
          </div>

          {error && <p className="mb-4 text-xs text-[var(--red)]">{error}</p>}

          <button
            onClick={handleConnectStripe}
            disabled={loading}
            className="mb-3 w-full rounded-xl bg-[#635BFF] py-3 text-sm font-semibold text-white transition-all hover:bg-[#5851ea] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Setting up…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                </svg>
                Connect with Stripe
              </span>
            )}
          </button>
        </>
      )}

      {/* Connected — show listing form */}
      {status === "connected" && (
        <>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">List a Ticket</h2>
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--green)]/10 px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              <span className="text-[0.6rem] font-semibold text-[var(--green)]">Stripe connected</span>
            </div>
          </div>

          {listSuccess && (
            <div className="mb-4 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20 p-3 text-xs text-[var(--green)]">
              Ticket listed successfully!
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Event</label>
              <input
                type="text"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                placeholder="Search for an event…"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="A"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Row</label>
                <input
                  type="text"
                  value={row}
                  onChange={(e) => setRow(e.target.value)}
                  placeholder="12"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Seat</label>
                <input
                  type="text"
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  placeholder="5"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Type (optional)</label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/40"
              >
                <option value="">General</option>
                <option value="floor">Floor</option>
                <option value="ga">General Admission</option>
                <option value="vip">VIP</option>
                <option value="box">Box</option>
              </select>
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-[var(--red)]">{error}</p>}

          <button
            onClick={handleListTicket}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Listing…
              </span>
            ) : "List Ticket"}
          </button>
        </>
      )}

      {/* API callout — always shown */}
      <div className="mt-6 rounded-lg bg-[var(--bg-secondary)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Agent API
          </span>
        </div>
        <code className="text-xs text-[var(--text-muted)]">POST /tickets/</code>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          List tickets programmatically with a delegated agent token.
        </p>
      </div>
    </div>
  );
}

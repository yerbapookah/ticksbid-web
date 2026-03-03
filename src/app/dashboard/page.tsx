"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_ORDERS = [
  {
    id: "ord-001",
    eventName: "Lakers vs. Warriors",
    eventType: "sports",
    venue: "Crypto.com Arena, Los Angeles",
    eventDate: "2026-03-14T20:00:00",
    purchaseDate: "2026-02-10T14:32:00",
    section: "Floor",
    row: "A",
    seat: "12",
    totalPaid: 385,
    status: "upcoming" as const,
    thumbnail: "https://images.unsplash.com/photo-1616353352910-15d970ac020b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    id: "ord-002",
    eventName: "Coachella Music Festival 2026",
    eventType: "festival",
    venue: "Empire Polo Club, Indio, CA",
    eventDate: "2026-04-10T12:00:00",
    purchaseDate: "2026-01-28T09:15:00",
    section: "GA",
    row: "-",
    seat: "GA",
    totalPaid: 499,
    status: "upcoming" as const,
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: "ord-003",
    eventName: "Les Misérables - National Tour",
    eventType: "theater",
    venue: "Kennedy Center, Washington DC",
    eventDate: "2026-02-19T19:30:00",
    purchaseDate: "2026-02-01T18:45:00",
    section: "Orchestra",
    row: "D",
    seat: "8",
    totalPaid: 175,
    status: "attended" as const,
    thumbnail: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

const MOCK_SALES = [
  {
    id: "sale-001",
    eventName: "Knicks vs. Celtics",
    eventType: "sports",
    venue: "Madison Square Garden, New York",
    eventDate: "2026-03-22T19:30:00",
    listDate: "2026-02-15T11:20:00",
    soldDate: "2026-02-20T16:45:00",
    section: "118",
    row: "14",
    seat: "5",
    salePrice: 220,
    fee: 17.6,
    netEarnings: 202.4,
    status: "completed" as const,
  },
  {
    id: "sale-002",
    eventName: "Dave Chappelle Live",
    eventType: "comedy",
    venue: "Radio City Music Hall, New York",
    eventDate: "2026-04-05T21:00:00",
    listDate: "2026-02-22T08:00:00",
    soldDate: null,
    section: "Mezzanine",
    row: "B",
    seat: "22",
    salePrice: 310,
    fee: null,
    netEarnings: null,
    status: "pending" as const,
  },
];

const MOCK_BIDS = [
  {
    id: "bid-001",
    eventName: "Taylor Swift - Eras Tour (Final)",
    eventType: "concert",
    venue: "MetLife Stadium, East Rutherford, NJ",
    eventDate: "2026-05-18T19:00:00",
    bidAmount: 275,
    maxAuto: 350,
    currentHigh: 290,
    auctionEnds: "2026-02-25T23:59:00",
    status: "outbid" as const,
  },
  {
    id: "bid-002",
    eventName: "NBA Finals - Game 1",
    eventType: "sports",
    venue: "TBD",
    eventDate: "2026-06-04T21:00:00",
    bidAmount: 420,
    maxAuto: 500,
    currentHigh: 420,
    auctionEnds: "2026-03-01T18:00:00",
    status: "winning" as const,
  },
  {
    id: "bid-003",
    eventName: "Hamilton - Broadway",
    eventType: "theater",
    venue: "Richard Rodgers Theatre, New York",
    eventDate: "2026-04-12T14:00:00",
    bidAmount: 195,
    maxAuto: 250,
    currentHigh: 195,
    auctionEnds: "2026-02-28T12:00:00",
    status: "winning" as const,
  },
];

const MOCK_OFFERS = [
  {
    id: "offer-001",
    eventName: "Coachella Music Festival 2026",
    eventType: "festival",
    section: "VIP",
    row: "-",
    seat: "VIP",
    offerAmount: 650,
    listedPrice: 799,
    offerDate: "2026-02-21T10:30:00",
    expiresAt: "2026-02-26T10:30:00",
    status: "pending" as const,
  },
  {
    id: "offer-002",
    eventName: "Lakers vs. Clippers",
    eventType: "sports",
    section: "210",
    row: "8",
    seat: "15",
    offerAmount: 95,
    listedPrice: 130,
    offerDate: "2026-02-23T14:00:00",
    expiresAt: "2026-02-28T14:00:00",
    status: "pending" as const,
  },
];

const MOCK_WALLET = {
  paymentMethods: [
    { id: "pm-001", type: "visa" as const, last4: "4242", expiry: "08/27", isDefault: true },
    { id: "pm-002", type: "mastercard" as const, last4: "8888", expiry: "12/26", isDefault: false },
  ],
  cryptoWallets: [
    { id: "cw-001", type: "usdc" as const, network: "Solana", address: "7xKX...m4Qp", balance: 1_240.50 },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}
function formatTime(d: string) {
  try { return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
  catch { return ""; }
}
function formatCurrency(n: number) { return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }

function timeUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hrs}h left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m left`;
}

function EventTypeBadge({ type }: { type: string }) {
  const cls: Record<string, string> = {
    concert: "badge-concert", sports: "badge-sports", theater: "badge-theater",
    comedy: "badge-comedy", festival: "badge-festival",
  };
  return <span className={`badge ${cls[type?.toLowerCase()] || "badge-concert"}`}>{type || "event"}</span>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    upcoming: { bg: "bg-[var(--accent)]/10", text: "text-[var(--accent-hover)]", label: "Upcoming" },
    attended: { bg: "bg-[var(--text-muted)]/10", text: "text-[var(--text-muted)]", label: "Attended" },
    completed: { bg: "bg-[var(--green)]/10", text: "text-[var(--green)]", label: "Completed" },
    pending: { bg: "bg-[var(--amber)]/10", text: "text-[var(--amber)]", label: "Pending" },
    winning: { bg: "bg-[var(--green)]/10", text: "text-[var(--green)]", label: "Winning" },
    outbid: { bg: "bg-[var(--red)]/10", text: "text-[var(--red)]", label: "Outbid" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "winning" || status === "completed" ? "bg-[var(--green)]" : status === "outbid" ? "bg-[var(--red)]" : status === "upcoming" ? "bg-[var(--accent-hover)]" : "bg-current"} ${status === "winning" ? "animate-pulse" : ""}`} />
      {s.label}
    </span>
  );
}

// ─── Sections ────────────────────────────────────────────────

function OrdersSection() {
  const upcoming = MOCK_ORDERS.filter((o) => o.status === "upcoming");
  const attended = MOCK_ORDERS.filter((o) => o.status === "attended");

  const renderOrder = (order: typeof MOCK_ORDERS[0]) => (
    <div key={order.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:p-4 transition-colors hover:border-[var(--border-hover)]">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{order.eventName}</h3>
        <StatusPill status={order.status} />
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-2">{order.venue}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
        <span>{formatDate(order.eventDate)} · {formatTime(order.eventDate)}</span>
        <span>Sec {order.section} · Row {order.row} · Seat {order.seat}</span>
        <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(order.totalPaid)}</span>
      </div>
      <p className="mt-1.5 text-[0.65rem] text-[var(--text-muted)]">Purchased {formatDate(order.purchaseDate)}</p>
    </div>
  );

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">Orders</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">Your ticket purchases</p>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Upcoming ({upcoming.length})</h3>
          <div className="flex flex-col gap-3">{upcoming.map(renderOrder)}</div>
        </div>
      )}
      {attended.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Attended ({attended.length})</h3>
          <div className="flex flex-col gap-3">{attended.map(renderOrder)}</div>
        </div>
      )}
    </div>
  );
}

function SalesSection() {
  const pending = MOCK_SALES.filter((s) => s.status === "pending");
  const completed = MOCK_SALES.filter((s) => s.status === "completed");

  const renderSale = (sale: typeof MOCK_SALES[0]) => (
    <div key={sale.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:p-4 transition-colors hover:border-[var(--border-hover)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{sale.eventName}</h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{sale.venue}</p>
        </div>
        <StatusPill status={sale.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--text-secondary)]">
        <span>{formatDate(sale.eventDate)} · {formatTime(sale.eventDate)}</span>
        <span>Sec {sale.section} · Row {sale.row} · Seat {sale.seat}</span>
      </div>
      <div className="mt-3 flex items-center gap-4 rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-xs">
        <div>
          <span className="text-[var(--text-muted)]">Listed </span>
          <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(sale.salePrice)}</span>
        </div>
        {sale.fee !== null && (
          <div>
            <span className="text-[var(--text-muted)]">Fee </span>
            <span className="text-[var(--text-secondary)]">{formatCurrency(sale.fee)}</span>
          </div>
        )}
        {sale.netEarnings !== null && (
          <div>
            <span className="text-[var(--text-muted)]">Net </span>
            <span className="font-semibold text-[var(--green)]">{formatCurrency(sale.netEarnings)}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-[0.7rem] text-[var(--text-muted)]">
        Listed {formatDate(sale.listDate)}
        {sale.soldDate && ` · Sold ${formatDate(sale.soldDate)}`}
      </p>
    </div>
  );

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">Sales</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">Tickets you&apos;re selling or have sold</p>

      {pending.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Pending ({pending.length})</h3>
          <div className="flex flex-col gap-3">{pending.map(renderSale)}</div>
        </div>
      )}
      {completed.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Completed ({completed.length})</h3>
          <div className="flex flex-col gap-3">{completed.map(renderSale)}</div>
        </div>
      )}
    </div>
  );
}

function BidsSection() {
  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">Active Bids</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">Auctions you&apos;re bidding on</p>

      <div className="flex flex-col gap-3">
        {MOCK_BIDS.map((bid) => (
          <div key={bid.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:p-4 transition-colors hover:border-[var(--border-hover)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{bid.eventName}</h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{bid.venue}</p>
              </div>
              <StatusPill status={bid.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--text-secondary)]">
              <span><EventTypeBadge type={bid.eventType} /></span>
              <span>{formatDate(bid.eventDate)}</span>
              <span className="text-[var(--amber)]">{timeUntil(bid.auctionEnds)}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 rounded-lg bg-[var(--bg-secondary)] px-3 py-2.5 text-xs">
              <div>
                <div className="text-[var(--text-muted)]">Your Bid</div>
                <div className="mt-0.5 font-semibold text-[var(--text-primary)]">{formatCurrency(bid.bidAmount)}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Max Auto</div>
                <div className="mt-0.5 font-semibold text-[var(--text-secondary)]">{formatCurrency(bid.maxAuto)}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Current High</div>
                <div className={`mt-0.5 font-semibold ${bid.currentHigh > bid.bidAmount ? "text-[var(--red)]" : "text-[var(--green)]"}`}>{formatCurrency(bid.currentHigh)}</div>
              </div>
            </div>
            <div className="mt-3">
              {bid.status === "winning" ? (
                <Link href={`/auctions/${bid.id}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2 text-xs font-medium text-white transition-all hover:bg-[var(--accent-hover)]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  View Auction
                </Link>
              ) : (
                <Link href={`/auctions/${bid.id}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--green)] py-2 text-xs font-medium text-white transition-all hover:brightness-110">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Place Higher Bid
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OffersSection() {
  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">Active Offers</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">Offers you&apos;ve made on listed tickets</p>

      <div className="flex flex-col gap-3">
        {MOCK_OFFERS.map((offer) => (
          <div key={offer.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:p-4 transition-colors hover:border-[var(--border-hover)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{offer.eventName}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <EventTypeBadge type={offer.eventType} />
                  <span>Sec {offer.section} · Row {offer.row} · Seat {offer.seat}</span>
                </div>
              </div>
              <StatusPill status={offer.status} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 rounded-lg bg-[var(--bg-secondary)] px-3 py-2.5 text-xs">
              <div>
                <div className="text-[var(--text-muted)]">Your Offer</div>
                <div className="mt-0.5 font-semibold text-[var(--accent-hover)]">{formatCurrency(offer.offerAmount)}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Listed Price</div>
                <div className="mt-0.5 font-semibold text-[var(--text-primary)]">{formatCurrency(offer.listedPrice)}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Discount</div>
                <div className="mt-0.5 font-semibold text-[var(--green)]">{Math.round((1 - offer.offerAmount / offer.listedPrice) * 100)}% off</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[0.7rem] text-[var(--text-muted)]">
              <span>Offered {formatDate(offer.offerDate)}</span>
              <span className="text-[var(--amber)]">Expires {formatDate(offer.expiresAt)}</span>
            </div>
            <div className="mt-3">
              <Link href={`/auctions/${offer.id}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2 text-xs font-medium text-white transition-all hover:bg-[var(--accent-hover)]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                View Listing
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletSection() {
  const cardIcon: Record<string, string> = { visa: "V", mastercard: "M", amex: "A" };

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">Wallet</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">Payment methods and crypto wallets</p>

      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Payment Methods</h3>
      <div className="mb-8 flex flex-col gap-3">
        {MOCK_WALLET.paymentMethods.map((pm) => (
          <div key={pm.id} className="flex items-center gap-3 sm:gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:p-4 transition-colors hover:border-[var(--border-hover)]">
            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-sm font-bold text-[var(--text-muted)]">
              {cardIcon[pm.type] || "?"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)] capitalize">{pm.type} •••• {pm.last4}</div>
              <div className="text-xs text-[var(--text-muted)]">Expires {pm.expiry}</div>
            </div>
            {pm.isDefault && (
              <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--accent-hover)]">
                Default
              </span>
            )}
          </div>
        ))}
        <button className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-transparent p-4 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Payment Method
        </button>
      </div>

      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Crypto Wallets</h3>
      <div className="flex flex-col gap-3">
        {MOCK_WALLET.cryptoWallets.map((cw) => (
          <div key={cw.id} className="flex items-center gap-3 sm:gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:p-4 transition-colors hover:border-[var(--border-hover)]">
            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[var(--green)]/10 text-sm font-bold text-[var(--green)]">
              $
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)]">USDC · {cw.network}</div>
              <div className="text-xs text-[var(--text-muted)] font-mono">{cw.address}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-[var(--green)]">{formatCurrency(cw.balance)}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">Available</div>
            </div>
          </div>
        ))}
        <button className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-transparent p-4 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Nav ─────────────────────────────────────────────

const TABS = [
  {
    id: "orders",
    label: "Orders",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    count: MOCK_ORDERS.length,
  },
  {
    id: "sales",
    label: "Sales",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    count: MOCK_SALES.length,
  },
  {
    id: "bids",
    label: "Bids",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    count: MOCK_BIDS.length,
  },
  {
    id: "offers",
    label: "Offers",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
    count: MOCK_OFFERS.length,
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    count: null,
  },
];

// ─── Main ────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("orders");

  const sections: Record<string, React.ReactNode> = {
    orders: <OrdersSection />,
    sales: <SalesSection />,
    bids: <BidsSection />,
    offers: <OffersSection />,
    wallet: <WalletSection />,
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-10">
      <div className="mb-5 sm:mb-8 fade-up">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Manage your tickets, bids, and payments</p>
      </div>

      {/* Mobile tab bar */}
      <div className="mb-6 flex gap-1 overflow-x-auto pb-1 scrollbar-hide md:hidden fade-up" style={{ animationDelay: "60ms" }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent-hover)]"
                  : "border border-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== null && <span className="text-[0.65rem]">({tab.count})</span>}
            </button>
          );
        })}
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop only */}
        <nav className="hidden md:block w-52 flex-shrink-0 fade-up" style={{ animationDelay: "60ms" }}>
          <div className="sticky top-24 flex flex-col gap-1">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    active
                      ? "bg-[var(--accent)]/10 text-[var(--accent-hover)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className={active ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]"}>{tab.icon}</span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`text-xs ${active ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1 fade-up" style={{ animationDelay: "120ms" }}>
          {sections[activeTab]}
        </div>
      </div>
    </div>
  );
}

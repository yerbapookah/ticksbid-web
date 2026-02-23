import Link from "next/link";

export default function AuctionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Auctions
        </h1>
        <p className="text-[var(--text-secondary)]">
          Bid on tickets and let price discovery do its thing.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-16 text-center fade-up">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-secondary)]">
          <svg className="h-10 w-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
          Coming Soon
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-[var(--text-muted)]">
          The auction system is live in the API but the marketplace UI is still being built.
          Agents can already place bids programmatically via the MCP server or REST API.
        </p>

        <div className="mx-auto max-w-sm rounded-lg bg-[var(--bg-secondary)] p-4">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Agent API Available
            </span>
          </div>
          <code className="text-xs text-[var(--text-muted)]">
            GET /auctions · POST /auctions/:id/bid
          </code>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-hover)] transition-colors hover:text-[var(--accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Browse events instead
        </Link>
      </div>
    </div>
  );
}

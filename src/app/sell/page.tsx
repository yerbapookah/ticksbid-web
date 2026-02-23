import Link from "next/link";

const FEE_TIERS = [
  { range: "1–5 sales / mo", fee: "8%", highlight: false },
  { range: "6–20 sales / mo", fee: "6%", highlight: false },
  { range: "21–50 sales / mo", fee: "4.5%", highlight: true },
  { range: "51+ sales / mo", fee: "3%", highlight: false },
];

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Sell Tickets
        </h1>
        <p className="text-[var(--text-secondary)]">
          List your tickets on TicksBid. Buyers pay zero fees — your listing price is exactly
          what they see. You pay a commission that drops as you sell more.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: fee structure */}
        <div className="fade-up">
          <h2 className="mb-5 text-lg font-semibold text-[var(--text-primary)]">
            Volume-Weighted Seller Fees
          </h2>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            The more you sell, the less you pay. Fees reset monthly. High-volume
            sellers keep the marketplace liquid and get rewarded for it.
          </p>

          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Monthly Volume
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEE_TIERS.map((tier) => (
                  <tr
                    key={tier.range}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      tier.highlight ? "bg-[var(--accent)]/5" : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                      {tier.range}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          tier.highlight ? "text-[var(--accent-hover)]" : "text-[var(--text-primary)]"
                        }`}
                      >
                        {tier.fee}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <div className="mb-1 text-2xl font-bold text-[var(--green)]">$0</div>
              <div className="text-xs text-[var(--text-muted)]">Buyer fees — always</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <div className="mb-1 text-2xl font-bold text-[var(--text-primary)]">&lt;24h</div>
              <div className="text-xs text-[var(--text-muted)]">Seller payout (stablecoin: instant)</div>
            </div>
          </div>
        </div>

        {/* Right: CTA panel */}
        <div className="fade-up" style={{ animationDelay: "100ms" }}>
          <div className="sticky top-24 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
              Start Selling
            </h2>
            <p className="mb-6 text-xs text-[var(--text-muted)]">
              Sign in to list tickets. Or use the API to list programmatically.
            </p>

            <button className="mb-3 w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-medium text-white transition-all hover:bg-[var(--accent-hover)]">
              Sign In to List Tickets
            </button>

            <Link
              href="/"
              className="block w-full rounded-lg border border-[var(--border)] py-3 text-center text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
            >
              Browse Events
            </Link>

            <div className="mt-6 rounded-lg bg-[var(--bg-secondary)] p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Agent API
                </span>
              </div>
              <code className="text-xs text-[var(--text-muted)]">
                POST /tickets/
              </code>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                List tickets programmatically with a delegated agent token.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

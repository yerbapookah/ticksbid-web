import SellerPanel from "@/components/SellerPanel";

const FEE_TIERS = [
  { range: "1–5 sales / mo", fee: "8%", highlight: false },
  { range: "6–20 sales / mo", fee: "6%", highlight: false },
  { range: "21–50 sales / mo", fee: "4.5%", highlight: true },
  { range: "51+ sales / mo", fee: "3%", highlight: false },
];

const SELLING_STEPS = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Find your event",
    desc: "Search for the event and enter your seat details.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Set your price",
    desc: "Choose a starting bid and optional buy-now price.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Go live",
    desc: "Your ticket is instantly listed. Buyers bid or buy now.",
  },
];

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 sm:py-16">
      <div className="mb-10 sm:mb-12 max-w-2xl">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Sell Tickets
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          List your tickets on TicksBid. Buyers pay zero fees — your listing price is exactly
          what they see. You pay a commission that drops as you sell more.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left: how it works + fee structure */}
        <div>
          {/* How it works */}
          <div className="mb-8">
            <h2 className="mb-5 text-lg font-semibold text-[var(--text-primary)]">
              How It Works
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {SELLING_STEPS.map((s, i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                    {s.icon}
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{s.title}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fee table */}
          <div>
            <h2 className="mb-5 text-lg font-semibold text-[var(--text-primary)]">
              Volume-Weighted Seller Fees
            </h2>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              The more you sell, the less you pay. Fees reset monthly.
            </p>

            <div className="overflow-hidden rounded-xl border border-[var(--border)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Monthly Volume
                    </th>
                    <th className="px-4 sm:px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
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
                      <td className="px-4 sm:px-5 py-3.5 text-sm text-[var(--text-secondary)]">
                        {tier.range}
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 text-right">
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
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
                <div className="mb-1 text-2xl font-bold text-[var(--green)]">$0</div>
                <div className="text-xs text-[var(--text-muted)]">Buyer fees — always</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
                <div className="mb-1 text-2xl font-bold text-[var(--text-primary)]">&lt;24h</div>
                <div className="text-xs text-[var(--text-muted)]">Seller payout</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: listing form */}
        <div>
          <SellerPanel />
        </div>
      </div>
    </div>
  );
}

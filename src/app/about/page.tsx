import Link from "next/link";

const FEE_TIERS = [
  { range: "1–5 sales / mo", fee: "8%" },
  { range: "6–20 sales / mo", fee: "6%" },
  { range: "21–50 sales / mo", fee: "4.5%" },
  { range: "51+ sales / mo", fee: "3%" },
];

function SectionHeading({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="mb-8">
      <span className="mb-3 inline-block text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--accent-hover)]">{label}</span>
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">{title}</h2>
      <p className="max-w-2xl text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-colors hover:border-[var(--border-hover)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent-hover)]">
        {icon}
      </div>
      <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-purple-900/5" />
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[var(--accent)]/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-800/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 fade-up">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
              A ticket marketplace<br />
              <span className="text-[var(--text-muted)]">that works for everyone</span>
            </h1>
            <p className="max-w-lg text-lg text-[var(--text-secondary)]">
              TicksBid is a secondary ticket marketplace built on a simple principle: buyers should never pay fees, sellers should be rewarded for volume, and the listed price should always be the final price.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Zero Buyer Fees */}
        <section className="py-16 fade-up">
          <SectionHeading
            label="For Buyers"
            title="Zero fees. Ever."
            description="On every other platform, you see a price, click buy, and get hit with 20-30% in service fees, facility charges, and processing costs. Not here. The price you see is the price you pay."
          />
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <div className="mb-1 text-3xl font-bold text-[var(--green)]">$0</div>
              <div className="mb-3 text-sm font-medium text-[var(--text-primary)]">Buyer fees</div>
              <p className="text-sm text-[var(--text-muted)]">No service fees, no facility fees, no processing fees. The listed price is your total.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <div className="mb-1 text-3xl font-bold text-[var(--text-primary)]">100%</div>
              <div className="mb-3 text-sm font-medium text-[var(--text-primary)]">Price transparency</div>
              <p className="text-sm text-[var(--text-muted)]">No hidden charges revealed at checkout. What you see on the listing is what you pay.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <div className="mb-1 text-3xl font-bold text-[var(--accent-hover)]">2</div>
              <div className="mb-3 text-sm font-medium text-[var(--text-primary)]">Ways to buy</div>
              <p className="text-sm text-[var(--text-muted)]">Buy tickets instantly at the listed price, or bid on auctions and name your own price.</p>
            </div>
          </div>
        </section>

        <hr className="border-[var(--border)]" />

        {/* Seller Fees */}
        <section className="py-16 fade-up">
          <SectionHeading
            label="For Sellers"
            title="Sell more, pay less"
            description="Sellers pay a commission that drops as they close more transactions. The more you sell, the lower your rate — rewarding the people who bring the most liquidity to the marketplace."
          />
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="overflow-hidden rounded-xl border border-[var(--border)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Monthly Volume</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {FEE_TIERS.map((tier) => (
                    <tr key={tier.range} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">{tier.range}</td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-[var(--text-primary)]">{tier.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">The flywheel</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  More sales → lower fees → more listings → more inventory for buyers → more sales. High-volume sellers keep the marketplace liquid and get rewarded for it.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Fast payouts</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Get paid within 24 hours via bank transfer, or instantly via stablecoin (USDC). You choose how you want to receive your money.
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-[var(--border)]" />

        {/* How It Works */}
        <section className="py-16 fade-up">
          <SectionHeading
            label="How It Works"
            title="Buy and sell in minutes"
            description="Whether you're looking for floor seats to the Knicks or listing extra concert tickets, the process is simple."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              title="Search"
              description="Find events by name, artist, venue, or date. Filter by type — concerts, sports, theater, comedy, festivals."
            />
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
              title="Choose"
              description="Compare tickets by section, row, and price. Buy instantly at the listed price or place a bid on an auction."
            />
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
              title="Pay"
              description="Pay with a credit card or USDC stablecoin. Zero fees added on top — the listed price is your total."
            />
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              title="Go"
              description="Your tickets are transferred to your account. Show up to the event — that's it."
            />
          </div>
        </section>

        <hr className="border-[var(--border)]" />

        {/* Agent API */}
        <section className="py-16 fade-up">
          <SectionHeading
            label="For Developers & Agents"
            title="Built for programmatic access"
            description="TicksBid isn't just a website. It's an API-first marketplace with a first-class MCP server, designed so AI agents can search, bid, and buy on behalf of their users."
          />
          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              title="REST API"
              description="Full read/write API for events, tickets, auctions, and bids. Search inventory, create listings, and execute purchases programmatically."
            />
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              title="MCP Server"
              description="Connect your AI agent directly to TicksBid via the Model Context Protocol. Conversational search, bidding, and ticket management."
            />
            <FeatureCard
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              title="Delegated Auth"
              description="Agents authenticate with scoped tokens — search only, bid up to $X, or full purchase authority. Users stay in control."
            />
          </div>
          <div className="mt-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">MCP Server — Open Source</span>
            </div>
            <code className="text-xs text-[var(--text-muted)]">github.com/yerbapookah/ticksbid-mcp</code>
          </div>
        </section>

        <hr className="border-[var(--border)]" />

        {/* CTA */}
        <section className="py-20 text-center fade-up">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            Ready to find your next event?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[var(--text-secondary)]">
            Browse events with zero buyer fees, or list your tickets and start selling today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--accent-hover)]">
              Browse Events
            </Link>
            <Link href="/sell" className="rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]">
              Start Selling
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

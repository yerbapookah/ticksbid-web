"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Help Data ───────────────────────────────────────────────

interface Article {
  q: string;
  a: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: Article[];
}

const CATEGORIES: Category[] = [
  {
    id: "general",
    title: "General",
    description: "Learn the basics of TicksBid",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    articles: [
      {
        q: "What is TicksBid?",
        a: "TicksBid is a secondary ticket marketplace where you can buy and sell tickets to concerts, sports, theater, comedy, and festival events. We charge zero fees to buyers — the listed price is always the final price.",
      },
      {
        q: "How is TicksBid different from other ticket marketplaces?",
        a: "Two key differences: (1) Buyers never pay fees. The price you see is the price you pay — no service fees, facility charges, or processing costs added at checkout. (2) Seller fees are volume-weighted, meaning the more you sell, the lower your commission rate drops (from 8% down to 3%).",
      },
      {
        q: "Is TicksBid safe to use?",
        a: "Yes. All transactions go through escrow — the buyer's payment is held until the ticket transfer is verified. If the ticket isn't delivered or doesn't work, you get a full refund.",
      },
      {
        q: "What types of events are listed?",
        a: "We cover concerts, sports, theater, comedy, and festivals. Our event catalog is continuously growing through automated crawlers and manual curation.",
      },
    ],
  },
  {
    id: "buying",
    title: "Buying",
    description: "Purchasing tickets on TicksBid",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    articles: [
      {
        q: "Are there any fees for buyers?",
        a: "No. Buyers pay zero fees on TicksBid. The listed price is your total — no service fees, no facility fees, no processing charges. Ever.",
      },
      {
        q: "How do I buy a ticket?",
        a: "Find the event you want, browse available tickets, and click Buy. You can pay with a credit card or USDC stablecoin. Your ticket will be transferred to your account after payment is confirmed.",
      },
      {
        q: "Can I make an offer below the listed price?",
        a: "Yes. On eligible listings, you can submit an offer below the asking price. The seller can accept, reject, or counter your offer. If accepted, you pay the agreed price with zero additional fees.",
      },
      {
        q: "What if my tickets don't work at the event?",
        a: "All purchases are protected by our guarantee. If your tickets are invalid or don't scan at the venue, contact support and we'll issue a full refund.",
      },
      {
        q: "Can I get a refund after purchasing?",
        a: "All sales are final once the ticket transfer is confirmed. However, you can re-list your tickets on TicksBid to sell them to someone else.",
      },
    ],
  },
  {
    id: "selling",
    title: "Selling",
    description: "Listing and selling your tickets",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    articles: [
      {
        q: "How do I list tickets for sale?",
        a: "Sign in, go to Sell, and select the event. Enter your seat details (section, row, seat number) and set your price. Your listing goes live immediately.",
      },
      {
        q: "What are the seller fees?",
        a: "Seller fees are volume-weighted and reset monthly: 8% for 1–5 sales, 6% for 6–20 sales, 4.5% for 21–50 sales, and 3% for 51+ sales. The more you sell, the less you pay.",
      },
      {
        q: "How do I get paid?",
        a: "Once the buyer confirms receipt of the tickets, your payout is processed. Bank transfers arrive within 24 hours. USDC stablecoin payouts are instant.",
      },
      {
        q: "How do I link my bank account?",
        a: "Go to Dashboard → Wallet and click 'Add Payment Method.' Follow the prompts to connect your bank account for receiving payouts.",
      },
      {
        q: "Can I edit or remove my listing?",
        a: "Yes. Go to Dashboard → Sales to view your active listings. You can update the price or remove the listing at any time before it sells.",
      },
    ],
  },
  {
    id: "auctions",
    title: "Auctions & Bidding",
    description: "How auctions work on TicksBid",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    articles: [
      {
        q: "How do auctions work?",
        a: "Sellers can list tickets as auctions with a reserve price and optional buy-it-now price. Buyers place bids, and the highest bidder wins when the auction ends. You can set a maximum auto-bid and the system will bid incrementally on your behalf up to that amount.",
      },
      {
        q: "What is auto-bidding?",
        a: "When you place a bid, you can set a maximum auto-bid amount. The system will automatically increase your bid in small increments to keep you as the highest bidder, up to your maximum. Other bidders won't see your max — only the current bid.",
      },
      {
        q: "What happens if I'm outbid?",
        a: "You'll receive a notification. You can place a new, higher bid from your Dashboard → Bids section, or let it go.",
      },
      {
        q: "Do buyer fees apply to auctions?",
        a: "No. Zero buyer fees applies to everything — fixed-price listings and auctions. The winning bid amount is your total cost.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Settings",
    description: "Managing your TicksBid account",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    articles: [
      {
        q: "How do I create an account?",
        a: "Click 'Get Started' and sign up with your email or Google account. You'll be able to buy and sell tickets immediately.",
      },
      {
        q: "How do I change my payment method?",
        a: "Go to Dashboard → Wallet. You can add, remove, or set a default payment method. We support credit cards and USDC stablecoin wallets.",
      },
      {
        q: "How do I contact support?",
        a: "Email us at support@ticksbid.com. We typically respond within a few hours during business days.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Contact support at support@ticksbid.com and request account deletion. Note that any active listings or pending transactions must be resolved first.",
      },
    ],
  },
];

// ─── Components ──────────────────────────────────────────────

function AccordionItem({ article, isOpen, onToggle }: { article: Article; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-[var(--accent-hover)]"
      >
        <span className="text-sm font-medium text-[var(--text-primary)]">{article.q}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 pb-4" : "max-h-0"}`}
      >
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{article.a}</p>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  isActive,
  onClick,
}: {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-shrink-0 items-center gap-4 rounded-xl border p-4 text-left transition-all lg:flex-shrink ${
        isActive
          ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
          : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
          isActive ? "bg-[var(--accent)]/15 text-[var(--accent-hover)]" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
        }`}
      >
        {category.icon}
      </div>
      <div>
        <h3 className={`text-sm font-semibold ${isActive ? "text-[var(--accent-hover)]" : "text-[var(--text-primary)]"}`}>
          {category.title}
        </h3>
        <p className="text-xs text-[var(--text-muted)]">{category.description}</p>
      </div>
      <div className="ml-auto flex-shrink-0">
        <span className={`text-xs ${isActive ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]"}`}>
          {category.articles.length}
        </span>
      </div>
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openArticle, setOpenArticle] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory)!;

  // Filter articles by search
  const filteredArticles = searchQuery.trim()
    ? CATEGORIES.flatMap((cat) =>
        cat.articles
          .filter(
            (a) =>
              a.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.a.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((a) => ({ ...a, category: cat.title }))
      )
    : null;

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-purple-900/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 fade-up">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              Help Center
            </h1>
            <p className="mb-8 text-[var(--text-secondary)]">
              Find answers to common questions about buying, selling, and using TicksBid.
            </p>
            <div className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus-within:border-[var(--accent)]/40 transition-colors">
              <div className="flex items-center pl-4 text-[var(--text-muted)]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpenArticle(null);
                }}
                placeholder="Search for help..."
                className="flex-1 bg-transparent px-3 py-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="flex items-center px-4 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support — prominent */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Get help from our team</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Can&apos;t find what you&apos;re looking for? Reach out directly.</p>
          </div>
          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            {/* Text */}
            <a
              href="sms:+12125551234"
              className="group flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center transition-all hover:border-[var(--green)]/40 hover:bg-[var(--green)]/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--green)]/10 text-[var(--green)] transition-colors group-hover:bg-[var(--green)]/15">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Text us</h3>
              <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--green)] px-5 py-2.5 text-sm font-medium text-white transition-all group-hover:brightness-110">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                (212) 555-1234
              </span>
            </a>
            {/* Email */}
            <a
              href="mailto:support@ticksbid.com"
              className="group flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent-hover)] transition-colors group-hover:bg-[var(--accent)]/15">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Email us</h3>
              <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-all group-hover:bg-[var(--accent-hover)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                support@ticksbid.com
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Search results */}
        {filteredArticles ? (
          <div className="fade-up">
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              {filteredArticles.length} result{filteredArticles.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
            </p>
            {filteredArticles.length > 0 ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5">
                {filteredArticles.map((article, i) => (
                  <div key={i}>
                    <div className="border-b border-[var(--border)] last:border-0">
                      <button
                        onClick={() => setOpenArticle(openArticle === i ? null : i)}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left"
                      >
                        <div>
                          <span className="text-sm font-medium text-[var(--text-primary)]">{article.q}</span>
                          <span className="ml-2 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{article.category}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${openArticle === i ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${openArticle === i ? "max-h-96 pb-4" : "max-h-0"}`}>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{article.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
                <p className="text-sm text-[var(--text-muted)]">No results found. Try a different search term or browse categories below.</p>
              </div>
            )}
          </div>
        ) : (
          /* Category browser */
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Left: categories — scrollable on mobile, sidebar on desktop */}
            <div className="fade-up">
              <div className="lg:sticky lg:top-24 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isActive={activeCategory === cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenArticle(null);
                    }}
                  />
                ))}


              </div>
            </div>

            {/* Right: articles */}
            <div className="fade-up" style={{ animationDelay: "80ms" }}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent-hover)]">
                  {currentCategory.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{currentCategory.title}</h2>
                  <p className="text-xs text-[var(--text-muted)]">{currentCategory.articles.length} articles</p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5">
                {currentCategory.articles.map((article, i) => (
                  <AccordionItem
                    key={i}
                    article={article}
                    isOpen={openArticle === i}
                    onToggle={() => setOpenArticle(openArticle === i ? null : i)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

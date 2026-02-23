import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicksBid — Secondary Ticket Marketplace",
  description: "Buy and sell event tickets with zero buyer fees. Built for humans and their agents.",
};

function Logo({ size = 32 }: { size?: number }) {
  const id = `lg-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Ticket shape — rounded rect with semicircle notches */}
      <path
        d="M4 8a4 4 0 014-4h20a4 4 0 014 4v8.27a4 4 0 00-2.5 3.73 4 4 0 002.5 3.73V32a4 4 0 01-4 4H8a4 4 0 01-4-4V23.73A4 4 0 006.5 20 4 4 0 004 16.27V8z"
        fill={`url(#${id})`}
      />
      {/* Dashed perforation line between notches */}
      <line x1="8" y1="20" x2="32" y2="20" stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2.5" />
      {/* Centered T letterform */}
      <rect x="10" y="12" width="16" height="4" rx="1" fill="white" fillOpacity="0.92" />
      <rect x="15.5" y="12" width="5" height="16" rx="1" fill="white" fillOpacity="0.92" />
    </svg>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <Logo size={32} />
          <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)] hidden sm:block">
            TicksBid
          </span>
        </Link>

        {/* Search bar */}
        <form action="/" method="GET" className="flex-1 max-w-xl">
          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] focus-within:border-[var(--accent)]/40 transition-colors">
            <div className="flex items-center pl-3 text-[var(--text-muted)]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search by artist, event, date, location, or venue"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
            />
          </div>
        </form>

        {/* Right: nav + dashboard + profile */}
        <div className="flex items-center gap-1">
          <nav className="hidden items-center md:flex">
            <Link href="/" className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">
              Events
            </Link>
            <Link href="/sell" className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">
              Sell
            </Link>
            <Link href="/about" className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">
              About
            </Link>
            <Link href="/help" className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">
              Help
            </Link>
          </nav>

          <div className="ml-2 flex items-center gap-2">
            <Link href="/dashboard" className="flex h-8 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
            <Link href="/profile" className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-xs font-bold text-[var(--accent-hover)] transition-all hover:border-[var(--border-hover)]">
              P
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="text-sm font-medium text-[var(--text-muted)]">TicksBid</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-[var(--text-muted)]">Zero buyer fees</span>
          <span className="text-xs text-[var(--text-muted)]">·</span>
          <span className="text-xs text-[var(--text-muted)]">Agent-native API</span>
          <span className="text-xs text-[var(--text-muted)]">·</span>
          <span className="text-xs text-[var(--text-muted)]">© 2026</span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

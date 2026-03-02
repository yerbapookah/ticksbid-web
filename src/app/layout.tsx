import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "@/lib/auth";
import HeaderAuth from "@/components/HeaderAuth";
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

        {/* Right: nav + auth */}
        <div className="ml-auto flex items-center gap-1">
          <nav className="hidden items-center md:flex">
            <Link href="/chat" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300 hover:bg-purple-500/10">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
              TicksBid AI
            </Link>
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

          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
      {/* Accent glow along top */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 pt-14 pb-10">
        {/* Top row: tagline left, columns + icons right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px 160px 60px', gap: '0', alignItems: 'start' }}>
          {/* Tagline + logo */}
          <div className="flex flex-col gap-5 pr-8">
            <p className="text-2xl font-bold leading-snug text-[var(--text-primary)]">
              Stop overpaying.<br />Start bidding.
            </p>
            <div className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="text-base font-semibold text-[var(--text-primary)]">TicksBid</span>
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Company</span>
            <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Home</Link>
            <Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">About</Link>
            <Link href="/help" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">FAQ</Link>
            <Link href="/privacy" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Terms &amp; Conditions</Link>
          </div>

          {/* Socials text */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Socials</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">LinkedIn</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Twitter</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">TikTok</a>
          </div>

          {/* Spacer */}
          <div />

          {/* Large social icons — pinned right */}
          <div className="flex flex-col items-end gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] transition-all hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/50">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] transition-all hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/50">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] transition-all hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/50">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-[var(--border)] pt-6">
          <span className="text-xs text-[var(--text-muted)]">&copy; 2026 TicksBid. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

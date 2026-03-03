"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-hover)] bg-[var(--bg-card)] transition-all active:scale-95 flex-shrink-0"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Panel */}
          <nav
            className="absolute top-0 right-0 h-full w-72 bg-[var(--bg-primary)] border-l border-[var(--border)] flex flex-col p-6 gap-1 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)]"
              >
                <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Link href="/chat" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/10">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
              TicksBid AI
            </Link>
            <Link href="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">Events</Link>
            <Link href="/sell" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">Sell</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">About</Link>
            <Link href="/help" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">Help</Link>
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <Link href="/login" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)]">
                Log in
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

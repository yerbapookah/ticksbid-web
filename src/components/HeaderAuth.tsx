"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function HeaderAuth() {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="ml-2">
        <Link
          href="/login"
          className="flex h-8 items-center rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-white transition-all hover:bg-[var(--accent-hover)]"
        >
          Log in
        </Link>
      </div>
    );
  }

  const initial = user?.username?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="ml-2 flex items-center gap-2">
      <Link
        href="/dashboard"
        className="flex h-8 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Dashboard
      </Link>
      <Link
        href="/profile"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-xs font-bold text-[var(--accent-hover)] transition-all hover:border-[var(--border-hover)]"
      >
        {initial}
      </Link>
    </div>
  );
}

import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--text-muted)]/10">
        <svg className="h-8 w-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Checkout canceled</h1>
      <p className="mb-8 text-sm text-[var(--text-muted)] leading-relaxed">
        No worries — your ticket is still available. You can come back and purchase it anytime before the auction ends.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)]"
      >
        Back to events
      </Link>
    </div>
  );
}

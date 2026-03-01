import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--green)]/10">
        <svg className="h-8 w-8 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">You&apos;re in!</h1>
      <p className="mb-8 text-sm text-[var(--text-muted)] leading-relaxed">
        Your ticket purchase was successful. You&apos;ll receive a confirmation with your ticket details shortly.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)]"
        >
          View my tickets
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
        >
          Browse more
        </Link>
      </div>
    </div>
  );
}

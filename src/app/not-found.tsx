import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center fade-up">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-secondary)]">
          <span className="text-3xl font-bold text-[var(--text-muted)]">404</span>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
          Not Found
        </h1>
        <p className="mb-8 text-sm text-[var(--text-muted)]">
          This page doesn&apos;t exist. Maybe the event was removed or the URL is wrong.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--accent-hover)]"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
}

import { getEvent } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function EventTypeBadge({ type }: { type: string }) {
  const cls: Record<string, string> = {
    concert: "badge-concert",
    sports: "badge-sports",
    theater: "badge-theater",
    comedy: "badge-comedy",
    festival: "badge-festival",
  };
  return (
    <span className={`badge ${cls[type?.toLowerCase()] || "badge-concert"}`}>
      {type || "event"}
    </span>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event;
  try {
    event = await getEvent(id);
  } catch {
    notFound();
  }

  const hasTickets = event.tickets && event.tickets.length > 0;

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0">
          {event.thumbnail_url ? (
            <img
              src={event.thumbnail_url}
              alt=""
              className="h-full w-full object-cover opacity-20 blur-2xl scale-110"
            />
          ) : (
            <div className="h-full w-full bg-[var(--bg-secondary)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)]/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to events
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left: event info */}
            <div className="fade-up">
              <div className="mb-4 flex items-center gap-3">
                <EventTypeBadge type={event.event_type} />
                <span className="rounded-md bg-[var(--green)]/15 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--green)]">
                  Zero buyer fees
                </span>
              </div>

              <h1 className="mb-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
                {event.name}
              </h1>

              <div className="mb-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <svg className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">
                    {formatDate(event.start_time)} · {formatTime(event.start_time)}
                  </span>
                </div>

                {event.venue && (
                  <div className="flex items-start gap-3 text-[var(--text-secondary)]">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{event.venue.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{event.venue.address}</p>
                      {event.venue.max_capacity && (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {event.venue.venue_type} · Capacity: {event.venue.max_capacity.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              {event.thumbnail_url && (
                <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                  <img
                    src={event.thumbnail_url}
                    alt={event.name}
                    className="aspect-[2/1] w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Right: ticket panel */}
            <div className="fade-up" style={{ animationDelay: "100ms" }}>
              <div className="sticky top-24 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
                  Available Tickets
                </h2>
                <p className="mb-5 text-xs text-[var(--text-muted)]">
                  Listed price is final — no hidden fees
                </p>

                {hasTickets ? (
                  <div className="flex flex-col gap-3">
                    {event.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 transition-colors hover:border-[var(--border-hover)]"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            Section {ticket.seat_section} · Row {ticket.seat_row}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Seat {ticket.seat_number}
                            {ticket.ticket_type && ` · ${ticket.ticket_type}`}
                          </p>
                        </div>
                        <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--accent-hover)]">
                          Buy
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-card)]">
                      <svg className="h-6 w-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      No tickets listed yet
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Be the first to list tickets for this event
                    </p>
                    <Link
                      href="/sell"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      List Tickets
                    </Link>
                  </div>
                )}

                {/* API callout */}
                <div className="mt-5 rounded-lg bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Agent API
                    </span>
                  </div>
                  <code className="text-xs text-[var(--text-muted)] break-all">
                    GET /events/{event.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

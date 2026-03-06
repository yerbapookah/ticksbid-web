import { getEvent, getTicketsWithAuctions, type TicketWithAuction } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import EventTicketsView from "@/components/EventTicketsView";
import Countdown from "@/components/AuctionCountdown";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
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

  let ticketsWithAuctions: TicketWithAuction[] = [];
  try {
    ticketsWithAuctions = await getTicketsWithAuctions(id);
  } catch (e) {
    console.error("Failed to fetch tickets from DB:", e);
  }

  const hasTickets = ticketsWithAuctions.length > 0;
  const eventStartTime = event.start_time;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8">
      {/* Top bar: back + event name + badge */}
      <div className="mb-4 sm:mb-6 fade-up">
        <Link
          href="/"
          className="mb-3 sm:mb-4 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl md:text-3xl">
            {event.name}
          </h1>
          <EventTypeBadge type={event.event_type} />
        </div>
      </div>

      {/* Main grid: tickets center, event info right */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 md:gap-8">

        {/* CENTER: Tickets */}
        <div className="fade-up" style={{ animationDelay: "100ms" }}>
          {/* Event countdown */}
          {eventStartTime && (
            <div className="mb-4">
              <Countdown endTime={eventStartTime} label="Time to event" />
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {hasTickets ? `${ticketsWithAuctions.length} Tickets Available` : "No Tickets Available"}
            </h2>
            <span className="rounded-md bg-[var(--green)]/15 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--green)]">
              Zero buyer fees
            </span>
          </div>

          {hasTickets ? (
            <EventTicketsView tickets={ticketsWithAuctions} eventName={event.name} venueName={event.venue?.name} eventType={event.event_type} layoutType={event.venue?.layout_type} layoutJson={event.venue?.layout_json} />
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--bg-card)]">
                <svg className="h-7 w-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
        </div>

        {/* RIGHT: Event info sidebar */}
        <div className="fade-up" style={{ animationDelay: "150ms" }}>
          <div className="md:sticky md:top-24 flex flex-col gap-4">

            {/* Thumbnail */}
            {event.thumbnail_url && (
              <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                <img
                  src={event.thumbnail_url}
                  alt={event.name}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            )}

            {/* Event details card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:p-5">
              <h3 className="mb-3 sm:mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Event Details
              </h3>

              <div className="flex flex-col gap-4">
                {/* Date & time */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
                    <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {formatDate(event.start_time)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatTime(event.start_time)}
                    </p>
                  </div>
                </div>

                {/* Venue */}
                {event.venue && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
                      <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{event.venue.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{event.venue.address}</p>
                      {event.venue.max_capacity && (
                        <p className="mt-1 text-[0.65rem] text-[var(--text-muted)]">
                          {event.venue.venue_type} · {event.venue.max_capacity.toLocaleString()} capacity
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sell CTA */}
            <Link
              href="/sell"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Sell Tickets for This Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

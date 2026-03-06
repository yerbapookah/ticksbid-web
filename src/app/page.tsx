import { searchEvents, getTicketCountsByEvent, type EventSummary } from "@/lib/data";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import SortDropdown from "@/components/SortDropdown";

function EventTypeBadge({ type }: { type: string }) {
  const cls: Record<string, string> = {
    concert: "badge-concert",
    sports: "badge-sports",
    theater: "badge-theater",
    comedy: "badge-comedy",
    festival: "badge-festival",
  };
  return <span className={`badge ${cls[type?.toLowerCase()] || "badge-concert"}`}>{type || "event"}</span>;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  } catch { return dateStr; }
}

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch { return ""; }
}

function EventCard({ event, index, popular, ticketCount }: { event: EventSummary; index: number; popular?: boolean; ticketCount?: number }) {
  return (
    <Link href={`/events/${event.id}`}>
      <div className="event-card fade-up group cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]" style={{ animationDelay: `${index * 60}ms` }}>
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg-secondary)]">
          {event.thumbnail_url ? (
            <img src={event.thumbnail_url} alt={event.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--border)]">
                <span className="text-2xl font-bold text-[var(--text-muted)]">{event.name?.charAt(0) || "?"}</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-60" />
          <div className="absolute left-3 top-3"><EventTypeBadge type={event.event_type} /></div>
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {popular && (
              <div className="rounded-md bg-[var(--bg-card)]/80 backdrop-blur px-2 py-1 shadow-lg">
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--amber)]">🔥 Popular</span>
              </div>
            )}
            <FavoriteButton eventId={event.id} />
          </div>
        </div>
        <div className="p-3 sm:p-5">
          <h3 className="mb-1.5 sm:mb-2 text-[0.85rem] sm:text-[0.95rem] font-semibold leading-tight text-[var(--text-primary)] group-hover:text-[var(--accent-hover)] transition-colors">
            {event.name}
          </h3>
          {ticketCount != null && ticketCount > 0 && (
            <div className="mb-2 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className="text-xs font-medium text-[var(--green)]">{ticketCount} ticket{ticketCount !== 1 ? "s" : ""} for sale</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.start_time)}</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span>{formatTime(event.start_time)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeroBanner() {
  return (
    <div className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-purple-900/5" />
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[var(--accent)]/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-800/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-20">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px] md:gap-12 md:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--accent-hover)]">Zero buyer fees — always</span>
            </div>
            <h1 className="display-heading mb-3 sm:mb-4 text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)]">
              Tickets for humans<br />
              <span className="text-[var(--text-muted)]">and their agents</span>
            </h1>
            <p className="max-w-lg text-sm sm:text-lg text-[var(--text-secondary)]">
              A secondary ticket marketplace with transparent pricing, no hidden fees, and a first-class API. Browse yourself or let your AI agent find the best deal.
            </p>
            <div className="mt-4 sm:mt-6">
              <a href="/login?signup=true" className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)]">
                Get Started
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>

          {/* How it works */}
          <div>
            <h2 style={{ transform: 'skewX(-8deg)' }} className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[var(--text-primary)] mb-2 sm:mb-3 text-center">Four ways to buy</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 backdrop-blur p-3 sm:p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                  <svg className="h-4 w-4 text-[var(--accent-hover)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">Place a Bid</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">Name your price and compete in the open market for tickets.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 backdrop-blur p-3 sm:p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--green)]/10">
                  <svg className="h-4 w-4 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">Buy Now</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">Pay the buy-it-now price and secure your tickets instantly.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 backdrop-blur p-3 sm:p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--amber)]/10">
                  <svg className="h-4 w-4 text-[var(--amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">Flash Bid</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">Send the seller a time-limited bid. If they don&apos;t respond, it expires and you owe nothing.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 backdrop-blur p-3 sm:p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">Tell TicksBid's AI What You Want</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">Describe in chat your budget and the tickets that you want. Let TicksBid buy on your behalf — on your terms.</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "", label: "Date (Soonest)" },
  { value: "date_desc", label: "Date (Latest)" },
  { value: "bid_desc", label: "Current Bid: High → Low" },
  { value: "bid_asc", label: "Current Bid: Low → High" },
  { value: "buynow_desc", label: "Buy Now: High → Low" },
  { value: "buynow_asc", label: "Buy Now: Low → High" },
  { value: "ending_asc", label: "Ending Soonest" },
  { value: "ending_desc", label: "Ending Latest" },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = params.q || "";
  const eventType = params.type || "";
  const sort = params.sort || "";

  let events: EventSummary[] = [];
  let ticketCounts: Record<string, number> = {};
  let error = "";

  try {
    events = await searchEvents(query || undefined, eventType || undefined, 40);

    // Apply sorting
    if (sort === "date_desc") {
      events.sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime());
    } else if (sort === "ending_asc") {
      events.sort((a, b) => new Date(a.start_time || 0).getTime() - new Date(b.start_time || 0).getTime());
    } else if (sort === "ending_desc") {
      events.sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime());
    }
    // bid_desc, bid_asc, buynow_desc, buynow_asc will sort once auction data is wired to events

    events = events.slice(0, 20);
  } catch (e) {
    error = "Failed to load events. Please try again.";
    console.error(e);
  }

  try {
    ticketCounts = await getTicketCountsByEvent();
  } catch (e) {
    console.error("Failed to fetch ticket counts:", e);
  }

  return (
    <>
      <HeroBanner />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-12">
        <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {query ? `Results for "${query}"` : "All Events"}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{events.length} event{events.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex items-center gap-3 pb-1 sm:pb-0">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {["All", "Concert", "Sports", "Theater", "Comedy", "Festival"].map((t) => {
                const val = t === "All" ? "" : t.toLowerCase();
                const active = eventType === val;
                return (
                  <Link key={t} href={`/?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(val ? { type: val } : {}), ...(sort ? { sort } : {}) }).toString()}`}
                    className={`flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${active ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"}`}>
                    {t}
                  </Link>
                );
              })}
            </div>
            <div className="hidden sm:block h-5 w-px bg-[var(--border)] flex-shrink-0" />
            <SortDropdown query={query} eventType={eventType} currentSort={sort} />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[var(--red)]/20 bg-[var(--red)]/5 p-6 text-center">
            <p className="text-sm text-[var(--red)]">{error}</p>
          </div>
        )}

        {!error && events.length === 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-secondary)]">
              <svg className="h-8 w-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="mb-1 text-base font-medium text-[var(--text-primary)]">No events found</h3>
            <p className="text-sm text-[var(--text-muted)]">Try a different search term or browse all events.</p>
          </div>
        )}

        {events.length > 0 && (
          <div className="grid gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} popular={i === 0 || i === 2 || i === 4} ticketCount={ticketCounts[event.id]} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

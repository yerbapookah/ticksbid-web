import Link from "next/link";

// Mock data — will be replaced with real API calls once auth is wired up
const MOCK_USER = {
  username: "paul_m",
  displayName: "Paul Molander",
  memberSince: "February 2026",
  rating: 4.8,
  totalRatings: 23,
  avatar: null as string | null,
};

const MOCK_STATS = {
  totalBuys: 14,
  totalSells: 9,
  totalEarnings: 3_420,
  totalSpend: 2_875,
  activeBids: 3,
  activeOffers: 2,
};

const MOCK_FAVORITES = [
  {
    id: "a9f93a62-a719-4cb0-a588-154a622e5162",
    name: "Lakers vs. Warriors",
    event_type: "sports",
    start_time: "2026-03-14T20:00:00",
    thumbnail_url: "https://images.unsplash.com/photo-1616353352910-15d970ac020b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  },
  {
    id: "d1c33b78-9588-4b1b-a024-d51024906554",
    name: "Les Misérables - National Tour",
    event_type: "theater",
    start_time: "2026-02-19T19:30:00",
    thumbnail_url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "f7a12b34-5678-4def-9012-abcdef345678",
    name: "Coachella Music Festival 2026",
    event_type: "festival",
    start_time: "2026-04-10T12:00:00",
    thumbnail_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const partial = rating - full;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          let fill = "text-[var(--border)]";
          if (i < full) fill = "text-[var(--amber)]";
          else if (i === full && partial >= 0.5) fill = "text-[var(--amber)]/60";
          return (
            <svg key={i} className={`h-4 w-4 ${fill}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-[var(--text-primary)]">{rating}</span>
      <span className="text-xs text-[var(--text-muted)]">({count} ratings)</span>
    </div>
  );
}

function StatBlock({
  label,
  value,
  prefix,
  accent,
}: {
  label: string;
  value: number;
  prefix?: string;
  accent?: string;
}) {
  const formatted = prefix
    ? `${prefix}${value.toLocaleString()}`
    : value.toLocaleString();

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--border-hover)]">
      <div className={`mb-1 text-2xl font-bold ${accent || "text-[var(--text-primary)]"}`}>
        {formatted}
      </div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
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

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ProfilePage() {
  const user = MOCK_USER;
  const stats = MOCK_STATS;
  const favorites = MOCK_FAVORITES;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* ---- Top: User Info ---- */}
      <div className="fade-up mb-10 flex items-center gap-6">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-[var(--accent-hover)]">
              {user.displayName.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {user.displayName}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-[var(--text-muted)]">@{user.username}</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-sm text-[var(--text-muted)]">
              Member since {user.memberSince}
            </span>
          </div>
          <div className="mt-2">
            <StarRating rating={user.rating} count={user.totalRatings} />
          </div>
        </div>
      </div>

      {/* ---- Middle: Stats Grid ---- */}
      <div className="fade-up mb-12" style={{ animationDelay: "80ms" }}>
        <h2 className="mb-5 text-lg font-semibold text-[var(--text-primary)]">Activity</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatBlock label="Total Buys" value={stats.totalBuys} />
          <StatBlock label="Total Sells" value={stats.totalSells} />
          <StatBlock
            label="Total Earnings"
            value={stats.totalEarnings}
            prefix="$"
            accent="text-[var(--green)]"
          />
          <StatBlock label="Total Spend" value={stats.totalSpend} prefix="$" />
          <StatBlock
            label="Active Bids"
            value={stats.activeBids}
            accent="text-[var(--accent-hover)]"
          />
          <StatBlock
            label="Active Offers"
            value={stats.activeOffers}
            accent="text-[var(--amber)]"
          />
        </div>
      </div>

      {/* ---- Bottom: Favorites ---- */}
      <div className="fade-up" style={{ animationDelay: "160ms" }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Favorited Events
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            {favorites.length} event{favorites.length !== 1 ? "s" : ""}
          </span>
        </div>

        {favorites.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-all hover:border-[var(--border-hover)]">
                  <div className="aspect-[16/10] overflow-hidden bg-[var(--bg-secondary)]">
                    {event.thumbnail_url ? (
                      <img
                        src={event.thumbnail_url}
                        alt={event.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-2xl font-bold text-[var(--text-muted)]">
                          {event.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2"><EventTypeBadge type={event.event_type} /></div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-hover)] transition-colors">
                      {event.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {formatDate(event.start_time)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
            <svg className="mx-auto mb-3 h-8 w-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-sm text-[var(--text-muted)]">No favorited events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

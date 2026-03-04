
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



export default function ProfilePage() {
  const user = MOCK_USER;
  const stats = MOCK_STATS;

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
            label="Flash Bids"
            value={stats.activeOffers}
            accent="text-[var(--amber)]"
          />
        </div>
      </div>

    </div>
  );
}

"use client";

import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import { useState, useEffect } from "react";
import FavoriteButton from "@/components/FavoriteButton";

interface FavEvent {
  id: string;
  name: string;
  event_type: string;
  start_time: string;
  thumbnail_url?: string;
}

function EventTypeBadge({ type }: { type: string }) {
  const cls: Record<string, string> = {
    concert: "badge-concert", sports: "badge-sports", theater: "badge-theater",
    comedy: "badge-comedy", festival: "badge-festival",
  };
  return <span className={`badge ${cls[type?.toLowerCase()] || "badge-concert"}`}>{type || "event"}</span>;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
  catch { return d; }
}

export default function ProfileFavorites() {
  const { favorites } = useFavorites();
  const [events, setEvents] = useState<FavEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    async function fetchEvents() {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";
      const fetched: FavEvent[] = [];

      await Promise.all(
        favorites.map(async (id) => {
          try {
            const res = await fetch(`${API_BASE}/events/${id}`);
            if (res.ok) {
              const ev = await res.json();
              fetched.push({
                id: ev.id,
                name: ev.name,
                event_type: ev.event_type || "event",
                start_time: ev.start_time || "",
                thumbnail_url: ev.thumbnail_url,
              });
            }
          } catch {
            // skip
          }
        })
      );

      setEvents(fetched);
      setLoading(false);
    }

    fetchEvents();
  }, [favorites]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Favorited Events
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-[var(--bg-secondary)]" />
              <div className="p-3">
                <div className="h-4 w-32 rounded bg-[var(--bg-secondary)] mb-2" />
                <div className="h-3 w-20 rounded bg-[var(--bg-secondary)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Favorited Events ({events.length})
        </h3>
      </div>
      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
          <svg className="mx-auto h-10 w-10 text-[var(--text-muted)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-sm text-[var(--text-muted)] mb-1">No favorites yet</p>
          <p className="text-xs text-[var(--text-muted)]">Tap the heart on any event to save it here.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-colors hover:border-[var(--border-hover)]">
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg-secondary)]">
                  {event.thumbnail_url ? (
                    <img src={event.thumbnail_url} alt={event.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-2xl font-bold text-[var(--text-muted)]">{event.name?.charAt(0) || "?"}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-60" />
                  <div className="absolute left-3 top-3"><EventTypeBadge type={event.event_type} /></div>
                  <div className="absolute right-3 top-3">
                    <FavoriteButton eventId={event.id} />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-hover)] transition-colors">{event.name}</h4>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDate(event.start_time)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

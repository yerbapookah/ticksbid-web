"use client";

import { useFavorites } from "@/context/FavoritesContext";

export default function FavoriteButton({
  eventId,
  className = "",
}: {
  eventId: string;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(eventId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(eventId);
      }}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      className={`group/heart flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-card)]/80 backdrop-blur shadow-lg transition-all hover:scale-110 active:scale-95 ${className}`}
    >
      <svg
        className={`h-4 w-4 transition-colors ${
          fav ? "text-[var(--red)] fill-[var(--red)]" : "text-white/70 fill-none group-hover/heart:text-[var(--red)]"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

"use client";

import { useState, useEffect } from "react";

interface Offer {
  id: string;
  ticket_id: string;
  offer_amount: string;
  bidder_name: string;
  status: string;
  expires_at: string;
  created_at: string;
}

function timeUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

export default function SellerOffers({ ticketId }: { ticketId: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch(`/api/offers?ticket_id=${ticketId}`);
        const data = await res.json();
        if (Array.isArray(data)) setOffers(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, [ticketId]);

  async function handleAction(offerId: string, action: "accept" | "reject") {
    setActionLoading(offerId);
    try {
      const res = await fetch("/api/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id: offerId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state
        setOffers((prev) =>
          prev.map((o) => {
            if (o.id === offerId) return { ...o, status: action === "accept" ? "accepted" : "rejected" };
            if (action === "accept" && o.status === "pending") return { ...o, status: "rejected" };
            return o;
          })
        );
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Failed to process offer");
    } finally {
      setActionLoading(null);
    }
  }

  const pending = offers.filter((o) => o.status === "pending" && new Date(o.expires_at) > new Date());
  const resolved = offers.filter((o) => o.status !== "pending" || new Date(o.expires_at) <= new Date());

  if (loading) return null;
  if (offers.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)]">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
        Offers ({pending.length} pending)
      </p>

      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((offer) => (
            <div
              key={offer.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-[var(--amber)]/5 border border-[var(--amber)]/20 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--amber)]">
                    ${parseFloat(offer.offer_amount).toFixed(2)}
                  </span>
                  <span className="text-[0.6rem] text-[var(--text-muted)]">
                    from {offer.bidder_name}
                  </span>
                </div>
                <p className="text-[0.6rem] text-[var(--amber)]">
                  {timeUntil(offer.expires_at)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleAction(offer.id, "accept")}
                  disabled={actionLoading === offer.id}
                  className="rounded-md bg-[var(--green)] px-3 py-1.5 text-[0.65rem] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading === offer.id ? "..." : "Accept"}
                </button>
                <button
                  onClick={() => handleAction(offer.id, "reject")}
                  disabled={actionLoading === offer.id}
                  className="rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1.5 text-[0.65rem] font-semibold text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="mt-2 space-y-1">
          {resolved.slice(0, 3).map((offer) => {
            const expired = offer.status === "pending" && new Date(offer.expires_at) <= new Date();
            const status = expired ? "expired" : offer.status;
            const statusColors: Record<string, string> = {
              accepted: "text-[var(--green)]",
              rejected: "text-[var(--red)]",
              expired: "text-[var(--text-muted)]",
            };
            return (
              <div key={offer.id} className="flex items-center justify-between text-[0.65rem] text-[var(--text-muted)] px-1">
                <span>${parseFloat(offer.offer_amount).toFixed(2)} from {offer.bidder_name}</span>
                <span className={`font-medium capitalize ${statusColors[status] || ""}`}>{status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

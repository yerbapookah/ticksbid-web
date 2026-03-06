"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

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

export default function SortDropdown({
  query,
  eventType,
  currentSort,
}: {
  query: string;
  eventType: string;
  currentSort: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label || "Date (Soonest)";
  const isActive = !!currentSort;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(val: string) {
    setOpen(false);
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (eventType) p.set("type", eventType);
    if (val) p.set("sort", val);
    router.push(`/?${p.toString()}`, { scroll: false });
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
          isActive
            ? "bg-[var(--accent)] text-white"
            : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
        }`}
      >
        {activeLabel}
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-xl shadow-black/30">
          {SORT_OPTIONS.map((opt) => {
            const selected = opt.value === currentSort;
            return (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors ${
                  selected
                    ? "text-[var(--accent-hover)] bg-[var(--accent)]/10"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                {selected && (
                  <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={selected ? "" : "pl-5"}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

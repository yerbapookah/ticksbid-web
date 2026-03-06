"use client";

import { useRouter } from "next/navigation";

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

  return (
    <select
      value={currentSort}
      onChange={(e) => {
        const val = e.target.value;
        const p = new URLSearchParams();
        if (query) p.set("q", query);
        if (eventType) p.set("type", eventType);
        if (val) p.set("sort", val);
        router.push(`/?${p.toString()}`);
      }}
      className={`flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer outline-none transition-all ${
        currentSort
          ? "bg-[var(--accent)] text-white"
          : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

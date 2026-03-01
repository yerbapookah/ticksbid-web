"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  endTime: string;
  label: string;
  compact?: boolean;
}

function getTimeRemaining(endTime: string) {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    expired: false,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeUnit({ value, label, compact }: { value: number; label: string; compact?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`${compact ? "text-sm" : "text-2xl"} font-bold tabular-nums text-[var(--text-primary)]`}>
        {String(value).padStart(2, "0")}
      </span>
      <span className={`${compact ? "text-[0.5rem]" : "text-[0.6rem]"} uppercase tracking-wider text-[var(--text-muted)]`}>
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ endTime, label, compact }: CountdownProps) {
  const [time, setTime] = useState(getTimeRemaining(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const expiredLabel = label.toLowerCase().includes("auction") ? "Auction ended" : "Event started";

  if (time.expired) {
    return (
      compact ? (
        <p className="text-sm font-medium text-[var(--text-muted)]">{expiredLabel}</p>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {expiredLabel}
          </span>
        </div>
      )
    );
  }

  if (compact) {
    const parts: string[] = [];
    if (time.days > 0) parts.push(`${time.days}d`);
    parts.push(`${String(time.hours).padStart(2, "0")}h`);
    parts.push(`${String(time.minutes).padStart(2, "0")}m`);
    parts.push(`${String(time.seconds).padStart(2, "0")}s`);

    return (
      <p className="text-sm font-medium text-[var(--text-primary)]">
        <span className="text-[var(--text-muted)]">{label}:</span>{" "}
        <span className="tabular-nums">{parts.join(" : ")}</span>
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--green)] animate-pulse" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {time.days > 0 && <TimeUnit value={time.days} label="days" />}
          <TimeUnit value={time.hours} label="hrs" />
          <span className="text-[var(--text-muted)] -mt-3 font-bold">:</span>
          <TimeUnit value={time.minutes} label="min" />
          <span className="text-[var(--text-muted)] -mt-3 font-bold">:</span>
          <TimeUnit value={time.seconds} label="sec" />
        </div>
      </div>
    </div>
  );
}

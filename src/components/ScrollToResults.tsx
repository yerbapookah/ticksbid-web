"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ScrollToResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    if (query) {
      const el = document.getElementById("results");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [query]);

  return null;
}

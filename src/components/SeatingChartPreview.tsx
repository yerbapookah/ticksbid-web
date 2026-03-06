"use client";

import SeatingChart from "@/components/SeatingChart";
import type { VenueType } from "@/lib/venueLayouts";

export default function SeatingChartPreview({
  venueName,
  eventType,
  layoutJson,
}: {
  venueName: string;
  eventType?: string;
  layoutJson?: string | null;
}) {
  return (
    <SeatingChart
      venueName={venueName}
      seats={[]}
      selectedTicketId={null}
      onSeatClick={() => {}}
      eventType={eventType}
      layoutJson={layoutJson}
    />
  );
}

"use client";

import SeatingChart from "@/components/SeatingChart";
import type { VenueType } from "@/lib/venueLayouts";

export default function SeatingChartPreview({
  venueName,
  eventType,
}: {
  venueName: string;
  eventType?: string;
}) {
  return (
    <SeatingChart
      venueName={venueName}
      seats={[]}
      selectedTicketId={null}
      onSeatClick={() => {}}
      eventType={eventType}
    />
  );
}

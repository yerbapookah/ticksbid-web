import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// Map event_id → old section → new real section
const SECTION_MAP: Record<string, Record<string, string>> = {
  // Lakers vs Warriors → Crypto.com Arena
  "a9f93a62-a719-4cb0-a588-154a622e5162": {
    "A": "101", "B": "209", "C": "305",
  },
  // Knicks vs Bulls → Madison Square Garden
  "83c33b9a-8e28-49dd-9a9c-f0e13bda1c68": {
    "A": "101", "B": "210", "C": "415",
  },
  // Les Mis → Broadway theater (Shubert)
  "d1c33b78-9588-4b1b-a024-d51024906554": {
    "A": "ORCH-C1", "B": "ORCH-L2", "C": "MEZZ-C1",
  },
  // John Mulaney → Chicago Theatre
  "d0a0676c-3aca-4f96-a6db-6ccebff82c5d": {
    "A": "ORCH-C1", "B": "ORCH-R1", "C": "MEZZ-C1",
  },
  // Coldplay → SoFi Stadium
  "f43dc96e-2814-4141-8f92-d8089712a731": {
    "A": "1", "B": "105", "C": "301",
  },
  // Taylor Swift → arena
  "2b7ce1ea-25e3-4b9f-af57-69a6f7032b16": {
    "A": "3", "B": "110", "C": "315",
  },
  // Bonnaroo → festival GA
  "2cbd7040-143c-4fe6-9d1d-ef2f1a34b30d": {
    "A": "GA-1", "B": "GA-2", "C": "VIP-1",
  },
};

export async function GET() {
  const results: string[] = [];

  for (const [eventId, mapping] of Object.entries(SECTION_MAP)) {
    for (const [oldSec, newSec] of Object.entries(mapping)) {
      try {
        const { rowCount } = await sql`
          UPDATE tickets
          SET seat_section = ${newSec}
          WHERE event_id = ${eventId}::uuid
          AND seat_section = ${oldSec}
        `;
        if (rowCount && rowCount > 0) {
          results.push(`✅ ${eventId}: ${oldSec} → ${newSec} (${rowCount} rows)`);
        }
      } catch (err) {
        results.push(`❌ ${eventId}: ${oldSec} → ${newSec}: ${err}`);
      }
    }
  }

  return NextResponse.json({ results });
}

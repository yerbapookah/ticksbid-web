// Venue layout definitions
// Each venue has sections positioned in an approximate real layout

export interface SectionDef {
  id: string;          // Section name/number
  label: string;       // Display label
  x: number;           // Center X position (0-1000 coordinate space)
  y: number;           // Center Y position
  width: number;       // Section width
  height: number;      // Section height
  rotation?: number;   // Rotation in degrees
  tier: "floor" | "lower" | "premier" | "upper";
  shape?: "rect" | "arc";
}

export interface VenueLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  courtOrStage: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    shape: "rect" | "ellipse";
  };
  sections: SectionDef[];
  tierColors: Record<string, string>;
}

// ------- CRYPTO.COM ARENA (Los Angeles) -------
// Basketball configuration — court at center, sections arranged in oval bowl

function generateCryptoArena(): VenueLayout {
  const sections: SectionDef[] = [];
  const cx = 500, cy = 400; // Center of arena

  // --- Floor sections (courtside) ---
  // Sections 1-9 around the court
  const floorSections = [
    { id: "1", x: 370, y: 290 },
    { id: "2", x: 500, y: 270 },
    { id: "3", x: 630, y: 290 },
    { id: "4", x: 680, y: 400 },
    { id: "5", x: 630, y: 510 },
    { id: "6", x: 500, y: 530 },
    { id: "7", x: 370, y: 510 },
    { id: "8", x: 320, y: 400 },
    { id: "9", x: 500, y: 400 }, // Center court
  ];
  for (const s of floorSections) {
    sections.push({
      id: s.id,
      label: `FL${s.id}`,
      x: s.x,
      y: s.y,
      width: 50,
      height: 30,
      tier: "floor",
    });
  }

  // --- Lower bowl (100-level) ---
  // 18 sections arranged in an oval
  const lowerCount = 18;
  const lowerRx = 280, lowerRy = 210;
  for (let i = 0; i < lowerCount; i++) {
    const angle = (i / lowerCount) * Math.PI * 2 - Math.PI / 2;
    const num = 101 + i;
    const x = cx + Math.cos(angle) * lowerRx;
    const y = cy + Math.sin(angle) * lowerRy;
    const rot = (angle * 180) / Math.PI + 90;
    sections.push({
      id: String(num),
      label: String(num),
      x,
      y,
      width: 56,
      height: 28,
      rotation: rot,
      tier: "lower",
    });
  }

  // --- Premier (200-level) ---
  const premierCount = 20;
  const premierRx = 340, premierRy = 260;
  for (let i = 0; i < premierCount; i++) {
    const angle = (i / premierCount) * Math.PI * 2 - Math.PI / 2;
    const num = 201 + i;
    const x = cx + Math.cos(angle) * premierRx;
    const y = cy + Math.sin(angle) * premierRy;
    const rot = (angle * 180) / Math.PI + 90;
    sections.push({
      id: String(num),
      label: String(num),
      x,
      y,
      width: 48,
      height: 22,
      rotation: rot,
      tier: "premier",
    });
  }

  // --- Upper bowl (300-level) ---
  const upperCount = 24;
  const upperRx = 410, upperRy = 320;
  for (let i = 0; i < upperCount; i++) {
    const angle = (i / upperCount) * Math.PI * 2 - Math.PI / 2;
    const num = 301 + i;
    const x = cx + Math.cos(angle) * upperRx;
    const y = cy + Math.sin(angle) * upperRy;
    const rot = (angle * 180) / Math.PI + 90;
    sections.push({
      id: String(num),
      label: String(num),
      x,
      y,
      width: 44,
      height: 20,
      rotation: rot,
      tier: "upper",
    });
  }

  return {
    id: "crypto-arena",
    name: "Crypto.com Arena",
    width: 1000,
    height: 800,
    courtOrStage: {
      x: 400,
      y: 330,
      width: 200,
      height: 140,
      label: "COURT",
      shape: "rect",
    },
    sections,
    tierColors: {
      floor: "#f59e0b",   // amber
      lower: "#6366f1",   // indigo
      premier: "#8b5cf6", // violet
      upper: "#64748b",   // slate
    },
  };
}

// ------- MADISON SQUARE GARDEN (New York) -------
function generateMSG(): VenueLayout {
  const sections: SectionDef[] = [];
  const cx = 500, cy = 400;

  // Floor
  const floorPositions = [
    { id: "1", x: 400, y: 310 },
    { id: "2", x: 500, y: 290 },
    { id: "3", x: 600, y: 310 },
    { id: "4", x: 620, y: 400 },
    { id: "5", x: 600, y: 490 },
    { id: "6", x: 500, y: 510 },
    { id: "7", x: 400, y: 490 },
    { id: "8", x: 380, y: 400 },
  ];
  for (const s of floorPositions) {
    sections.push({ id: s.id, label: `FL${s.id}`, x: s.x, y: s.y, width: 48, height: 28, tier: "floor" });
  }

  // 100-level (circular, MSG is round)
  const lowerCount = 22;
  const lowerR = 260;
  for (let i = 0; i < lowerCount; i++) {
    const angle = (i / lowerCount) * Math.PI * 2 - Math.PI / 2;
    sections.push({
      id: String(101 + i),
      label: String(101 + i),
      x: cx + Math.cos(angle) * lowerR,
      y: cy + Math.sin(angle) * lowerR,
      width: 50,
      height: 24,
      rotation: (angle * 180) / Math.PI + 90,
      tier: "lower",
    });
  }

  // 200-level
  const midCount = 26;
  const midR = 330;
  for (let i = 0; i < midCount; i++) {
    const angle = (i / midCount) * Math.PI * 2 - Math.PI / 2;
    sections.push({
      id: String(201 + i),
      label: String(201 + i),
      x: cx + Math.cos(angle) * midR,
      y: cy + Math.sin(angle) * midR,
      width: 44,
      height: 20,
      rotation: (angle * 180) / Math.PI + 90,
      tier: "premier",
    });
  }

  // 400-level (MSG skips 300s)
  const upperCount = 28;
  const upperR = 390;
  for (let i = 0; i < upperCount; i++) {
    const angle = (i / upperCount) * Math.PI * 2 - Math.PI / 2;
    sections.push({
      id: String(401 + i),
      label: String(401 + i),
      x: cx + Math.cos(angle) * upperR,
      y: cy + Math.sin(angle) * upperR,
      width: 40,
      height: 18,
      rotation: (angle * 180) / Math.PI + 90,
      tier: "upper",
    });
  }

  return {
    id: "msg",
    name: "Madison Square Garden",
    width: 1000,
    height: 800,
    courtOrStage: { x: 410, y: 340, width: 180, height: 120, label: "COURT", shape: "rect" },
    sections,
    tierColors: { floor: "#f59e0b", lower: "#3b82f6", premier: "#8b5cf6", upper: "#64748b" },
  };
}

// ------- THEATER / CONCERT (generic end-stage) -------
function generateTheaterLayout(): VenueLayout {
  const sections: SectionDef[] = [];

  // Orchestra — 3 wide columns, 6 rows deep
  const orchCols = ["L", "C", "R"];
  const orchRows = 6;
  for (let r = 0; r < orchRows; r++) {
    for (let c = 0; c < orchCols.length; c++) {
      const id = `ORCH-${orchCols[c]}${r + 1}`;
      sections.push({
        id,
        label: `${orchCols[c]}${r + 1}`,
        x: 300 + c * 200,
        y: 250 + r * 55,
        width: 170,
        height: 42,
        tier: "floor",
      });
    }
  }

  // Mezzanine — 3 columns, 3 rows
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const id = `MEZZ-${orchCols[c]}${r + 1}`;
      sections.push({
        id,
        label: `M${orchCols[c]}${r + 1}`,
        x: 300 + c * 200,
        y: 610 + r * 50,
        width: 170,
        height: 38,
        tier: "premier",
      });
    }
  }

  // Balcony — side sections
  for (let r = 0; r < 4; r++) {
    sections.push({
      id: `BAL-L${r + 1}`,
      label: `BL${r + 1}`,
      x: 120,
      y: 280 + r * 70,
      width: 80,
      height: 55,
      tier: "upper",
    });
    sections.push({
      id: `BAL-R${r + 1}`,
      label: `BR${r + 1}`,
      x: 880,
      y: 280 + r * 70,
      width: 80,
      height: 55,
      tier: "upper",
    });
  }

  return {
    id: "theater",
    name: "Theater",
    width: 1000,
    height: 800,
    courtOrStage: { x: 300, y: 100, width: 400, height: 100, label: "STAGE", shape: "rect" },
    sections,
    tierColors: { floor: "#f59e0b", lower: "#6366f1", premier: "#8b5cf6", upper: "#64748b" },
  };
}

// ------- REGISTRY -------
const VENUE_LAYOUTS: Record<string, () => VenueLayout> = {
  "crypto-arena": generateCryptoArena,
  "cryptocom-arena": generateCryptoArena,
  "crypto.com arena": generateCryptoArena,
  "staples center": generateCryptoArena,
  "madison square garden": generateMSG,
  "msg": generateMSG,
  "theater": generateTheaterLayout,
  "broadway": generateTheaterLayout,
  "shubert theatre": generateTheaterLayout,
  "imperial theatre": generateTheaterLayout,
  "gershwin theatre": generateTheaterLayout,
  "al hirschfeld theatre": generateTheaterLayout,
  "winter garden theatre": generateTheaterLayout,
  "beacon theatre": generateTheaterLayout,
  "chicago theatre": generateTheaterLayout,
  "radio city music hall": generateTheaterLayout,
  "sofi stadium": generateCryptoArena,
  "barclays center": generateMSG,
  "united center": generateCryptoArena,
  "chase center": generateCryptoArena,
  "kia forum": generateCryptoArena,
  "the forum": generateCryptoArena,
};

export function getVenueLayout(venueName: string): VenueLayout | null {
  const key = venueName.toLowerCase().trim();

  // Exact match
  if (VENUE_LAYOUTS[key]) return VENUE_LAYOUTS[key]();

  // Partial match
  for (const [k, gen] of Object.entries(VENUE_LAYOUTS)) {
    if (key.includes(k) || k.includes(key)) return gen();
  }

  return null;
}

// Fallback: generate a generic layout from ticket data
export function generateGenericLayout(sections: string[]): VenueLayout {
  const unique = [...new Set(sections)].sort();
  const defs: SectionDef[] = [];
  const cx = 500, cy = 400;
  const count = unique.length;
  const radius = Math.min(300, 100 + count * 15);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    defs.push({
      id: unique[i],
      label: unique[i],
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      width: 55,
      height: 30,
      rotation: (angle * 180) / Math.PI + 90,
      tier: "lower",
    });
  }

  return {
    id: "generic",
    name: "Venue",
    width: 1000,
    height: 800,
    courtOrStage: { x: 410, y: 340, width: 180, height: 120, label: "STAGE", shape: "rect" },
    sections: defs,
    tierColors: { floor: "#f59e0b", lower: "#6366f1", premier: "#8b5cf6", upper: "#64748b" },
  };
}

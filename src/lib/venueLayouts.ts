// Venue layout definitions
// Each venue has sections positioned in an approximate real layout
// Supports: arena (oval), stadium (rectangular), theater (end-stage),
//           amphitheater (semicircle), club (small end-stage)

export interface SectionDef {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
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

export type VenueType = "arena" | "stadium" | "theater" | "amphitheater" | "club" | "generic";

// ═══════════════════════════════════════════════════════════════════
// ARENA — oval bowl (basketball, hockey, concerts in arenas)
// ═══════════════════════════════════════════════════════════════════

function generateArena(name: string, stageLabel = "COURT"): VenueLayout {
  const sections: SectionDef[] = [];
  const cx = 500, cy = 400;

  // Floor sections (courtside)
  const floorPositions = [
    { id: "1", x: 370, y: 290 }, { id: "2", x: 500, y: 270 },
    { id: "3", x: 630, y: 290 }, { id: "4", x: 680, y: 400 },
    { id: "5", x: 630, y: 510 }, { id: "6", x: 500, y: 530 },
    { id: "7", x: 370, y: 510 }, { id: "8", x: 320, y: 400 },
  ];
  for (const s of floorPositions) {
    sections.push({
      id: s.id, label: `FL${s.id}`, x: s.x, y: s.y,
      width: 50, height: 30, tier: "floor",
    });
  }

  // Lower bowl (100-level) — 18 sections in oval
  const lowerCount = 18;
  const lowerRx = 280, lowerRy = 210;
  for (let i = 0; i < lowerCount; i++) {
    const angle = (i / lowerCount) * Math.PI * 2 - Math.PI / 2;
    const num = 101 + i;
    sections.push({
      id: String(num), label: String(num),
      x: cx + Math.cos(angle) * lowerRx,
      y: cy + Math.sin(angle) * lowerRy,
      width: 56, height: 28,
      rotation: (angle * 180) / Math.PI + 90,
      tier: "lower",
    });
  }

  // Premier (200-level)
  const premierCount = 20;
  const premierRx = 340, premierRy = 260;
  for (let i = 0; i < premierCount; i++) {
    const angle = (i / premierCount) * Math.PI * 2 - Math.PI / 2;
    const num = 201 + i;
    sections.push({
      id: String(num), label: String(num),
      x: cx + Math.cos(angle) * premierRx,
      y: cy + Math.sin(angle) * premierRy,
      width: 48, height: 22,
      rotation: (angle * 180) / Math.PI + 90,
      tier: "premier",
    });
  }

  // Upper bowl (300-level)
  const upperCount = 24;
  const upperRx = 410, upperRy = 320;
  for (let i = 0; i < upperCount; i++) {
    const angle = (i / upperCount) * Math.PI * 2 - Math.PI / 2;
    const num = 301 + i;
    sections.push({
      id: String(num), label: String(num),
      x: cx + Math.cos(angle) * upperRx,
      y: cy + Math.sin(angle) * upperRy,
      width: 44, height: 20,
      rotation: (angle * 180) / Math.PI + 90,
      tier: "upper",
    });
  }

  return {
    id: "arena",
    name,
    width: 1000,
    height: 800,
    courtOrStage: {
      x: 400, y: 330, width: 200, height: 140,
      label: stageLabel, shape: stageLabel === "COURT" ? "rect" : "ellipse",
    },
    sections,
    tierColors: {
      floor: "#f59e0b", lower: "#6366f1",
      premier: "#8b5cf6", upper: "#64748b",
    },
  };
}


// ═══════════════════════════════════════════════════════════════════
// STADIUM — rectangular bowl (football, soccer, large concerts)
// ═══════════════════════════════════════════════════════════════════

function generateStadium(name: string, fieldLabel = "FIELD"): VenueLayout {
  const sections: SectionDef[] = [];
  const cx = 500, cy = 400;
  const fieldW = 300, fieldH = 160;

  // Field-level sections along long sides
  for (let i = 0; i < 8; i++) {
    // Left sideline
    sections.push({
      id: `F${i + 1}L`, label: `F${i + 1}`,
      x: 220 + i * 70, y: 280,
      width: 60, height: 30, tier: "floor",
    });
    // Right sideline
    sections.push({
      id: `F${i + 1}R`, label: `F${i + 8 + 1}`,
      x: 220 + i * 70, y: 520,
      width: 60, height: 30, tier: "floor",
    });
  }

  // Lower bowl — rectangular perimeter
  const lowerSections = [
    // Top (north)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: String(101 + i), x: 170 + i * 66, y: 220,
      width: 58, height: 26, rotation: 0,
    })),
    // Bottom (south)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: String(121 + i), x: 170 + i * 66, y: 580,
      width: 58, height: 26, rotation: 0,
    })),
    // Left (west)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: String(111 + i), x: 120, y: 290 + i * 75,
      width: 58, height: 26, rotation: 90,
    })),
    // Right (east)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: String(131 + i), x: 880, y: 290 + i * 75,
      width: 58, height: 26, rotation: 90,
    })),
  ];
  for (const s of lowerSections) {
    sections.push({ ...s, label: s.id, tier: "lower" });
  }

  // Upper deck — wider rectangular perimeter
  const upperSections = [
    ...Array.from({ length: 12 }, (_, i) => ({
      id: String(301 + i), x: 130 + i * 62, y: 150,
      width: 52, height: 22, rotation: 0,
    })),
    ...Array.from({ length: 12 }, (_, i) => ({
      id: String(321 + i), x: 130 + i * 62, y: 650,
      width: 52, height: 22, rotation: 0,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      id: String(313 + i), x: 60, y: 220 + i * 90,
      width: 52, height: 22, rotation: 90,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      id: String(333 + i), x: 940, y: 220 + i * 90,
      width: 52, height: 22, rotation: 90,
    })),
  ];
  for (const s of upperSections) {
    sections.push({ ...s, label: s.id, tier: "upper" });
  }

  return {
    id: "stadium",
    name,
    width: 1000,
    height: 800,
    courtOrStage: {
      x: cx - fieldW / 2, y: cy - fieldH / 2,
      width: fieldW, height: fieldH,
      label: fieldLabel, shape: "rect",
    },
    sections,
    tierColors: {
      floor: "#f59e0b", lower: "#6366f1",
      premier: "#8b5cf6", upper: "#64748b",
    },
  };
}


// ═══════════════════════════════════════════════════════════════════
// THEATER — end-stage, rectangular orchestra + mezzanine + balcony
// ═══════════════════════════════════════════════════════════════════

function generateTheater(name: string): VenueLayout {
  const sections: SectionDef[] = [];
  const cols = ["L", "C", "R"];

  // Orchestra — 3 columns × 6 rows
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 3; c++) {
      const id = `ORCH-${cols[c]}${r + 1}`;
      sections.push({
        id, label: `${cols[c]}${r + 1}`,
        x: 300 + c * 200, y: 250 + r * 55,
        width: 170, height: 42, tier: "floor",
      });
    }
  }

  // Mezzanine — 3 columns × 3 rows
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const id = `MEZZ-${cols[c]}${r + 1}`;
      sections.push({
        id, label: `M${cols[c]}${r + 1}`,
        x: 300 + c * 200, y: 610 + r * 50,
        width: 170, height: 38, tier: "premier",
      });
    }
  }

  // Balcony side boxes
  for (let r = 0; r < 4; r++) {
    sections.push({
      id: `BAL-L${r + 1}`, label: `BL${r + 1}`,
      x: 120, y: 280 + r * 70,
      width: 80, height: 55, tier: "upper",
    });
    sections.push({
      id: `BAL-R${r + 1}`, label: `BR${r + 1}`,
      x: 880, y: 280 + r * 70,
      width: 80, height: 55, tier: "upper",
    });
  }

  return {
    id: "theater",
    name,
    width: 1000,
    height: 800,
    courtOrStage: { x: 300, y: 100, width: 400, height: 100, label: "STAGE", shape: "rect" },
    sections,
    tierColors: {
      floor: "#f59e0b", lower: "#6366f1",
      premier: "#8b5cf6", upper: "#64748b",
    },
  };
}


// ═══════════════════════════════════════════════════════════════════
// AMPHITHEATER — semicircular seating facing stage
// ═══════════════════════════════════════════════════════════════════

function generateAmphitheater(name: string): VenueLayout {
  const sections: SectionDef[] = [];
  const cx = 500, stageY = 150;

  // Pit / Floor — 2 rows of 5 sections
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const id = `PIT-${r + 1}${String.fromCharCode(65 + c)}`;
      sections.push({
        id, label: `P${r + 1}${String.fromCharCode(65 + c)}`,
        x: 250 + c * 100, y: 300 + r * 55,
        width: 85, height: 42, tier: "floor",
      });
    }
  }

  // Lower semicircle — 3 tiers fanning out
  const tiers = [
    { count: 9, radius: 260, tier: "lower" as const, w: 65, h: 28, startNum: 101 },
    { count: 11, radius: 330, tier: "premier" as const, w: 58, h: 24, startNum: 201 },
    { count: 13, radius: 400, tier: "upper" as const, w: 52, h: 22, startNum: 301 },
  ];

  for (const t of tiers) {
    for (let i = 0; i < t.count; i++) {
      // Semicircle from ~160° to ~20° (facing stage at top)
      const angle = Math.PI * 0.15 + (i / (t.count - 1)) * Math.PI * 0.7;
      const x = cx + Math.cos(angle) * t.radius;
      const y = stageY + 150 + Math.sin(angle) * t.radius;
      const rot = (angle * 180) / Math.PI - 90;
      sections.push({
        id: String(t.startNum + i), label: String(t.startNum + i),
        x, y, width: t.w, height: t.h, rotation: rot, tier: t.tier,
      });
    }
  }

  // Lawn section at back
  sections.push({
    id: "LAWN", label: "LAWN",
    x: 500, y: 720,
    width: 400, height: 50, tier: "upper",
  });

  return {
    id: "amphitheater",
    name,
    width: 1000,
    height: 800,
    courtOrStage: { x: 300, y: 100, width: 400, height: 100, label: "STAGE", shape: "rect" },
    sections,
    tierColors: {
      floor: "#f59e0b", lower: "#6366f1",
      premier: "#8b5cf6", upper: "#64748b",
    },
  };
}


// ═══════════════════════════════════════════════════════════════════
// CLUB — small venue, GA + VIP sections
// ═══════════════════════════════════════════════════════════════════

function generateClub(name: string): VenueLayout {
  const sections: SectionDef[] = [];

  // GA floor — single big area divided into zones
  const gaZones = [
    { id: "GA-FRONT", label: "GA Front", x: 500, y: 350, w: 350, h: 80 },
    { id: "GA-MID", label: "GA Middle", x: 500, y: 450, w: 400, h: 80 },
    { id: "GA-BACK", label: "GA Back", x: 500, y: 550, w: 450, h: 80 },
  ];
  for (const z of gaZones) {
    sections.push({
      id: z.id, label: z.label,
      x: z.x, y: z.y,
      width: z.w, height: z.h, tier: "lower",
    });
  }

  // VIP sections — flanking the stage
  sections.push({
    id: "VIP-L", label: "VIP Left",
    x: 220, y: 300, width: 100, height: 70, tier: "floor",
  });
  sections.push({
    id: "VIP-R", label: "VIP Right",
    x: 780, y: 300, width: 100, height: 70, tier: "floor",
  });

  // Balcony / Mezzanine
  sections.push({
    id: "MEZZ", label: "Mezzanine",
    x: 500, y: 680, width: 500, height: 50, tier: "upper",
  });

  return {
    id: "club",
    name,
    width: 1000,
    height: 800,
    courtOrStage: { x: 300, y: 120, width: 400, height: 120, label: "STAGE", shape: "rect" },
    sections,
    tierColors: {
      floor: "#f59e0b", lower: "#6366f1",
      premier: "#8b5cf6", upper: "#64748b",
    },
  };
}


// ═══════════════════════════════════════════════════════════════════
// VENUE TYPE CLASSIFIER
// ═══════════════════════════════════════════════════════════════════

const ARENA_KEYWORDS = [
  "arena", "center", "centre", "garden", "coliseum", "colosseum",
  "pavilion", "fieldhouse", "field house", "spectrum", "palace",
  "forum", "staples", "crypto", "barclays", "chase center",
  "united center", "td garden", "wells fargo center", "scotiabank",
  "american airlines", "toyota center", "ball arena", "ppg paints",
  "prudential center", "little caesars", "climate pledge",
  "kia center", "frost bank", "moody center", "intuit dome",
];

const STADIUM_KEYWORDS = [
  "stadium", "field", "park", "dome", "bowl",
  "metlife", "sofi", "gillette", "lambeau", "arrowhead",
  "lincoln financial", "soldier field", "lumen field",
  "at&t stadium", "mercedes-benz", "allegiant", "hard rock",
  "raymond james", "empower field", "nrg", "us bank",
  "lucas oil", "caesars superdome", "acrisure",
  "wrigley", "fenway", "dodger", "yankee", "citi field",
  "oracle park", "petco park", "truist park", "minute maid",
];

const THEATER_KEYWORDS = [
  "theatre", "theater", "broadway", "playhouse", "opera",
  "performing arts", "concert hall", "symphony", "auditorium",
  "richard rodgers", "shubert", "imperial", "gershwin",
  "al hirschfeld", "winter garden", "beacon", "chicago theatre",
  "radio city", "carnegie hall", "kennedy center", "david geffen",
  "walt disney concert", "dorothy chandler", "lincoln center",
];

const AMPHITHEATER_KEYWORDS = [
  "amphitheatre", "amphitheater", "amph", "pavilion outdoor",
  "outdoor", "shed", "lawn", "gorge", "red rocks",
  "hollywood bowl", "greek theatre", "jones beach",
  "jiffy lube live", "blossom", "pine knob", "ruoff",
  "pnc music", "cynthia woods", "ak-chin", "sunlight supply",
  "usana", "shoreline", "mountain winery",
];

const CLUB_KEYWORDS = [
  "club", "lounge", "bar", "tavern", "hall",
  "house of blues", "webster hall", "bowery ballroom",
  "terminal 5", "irving plaza", "brooklyn steel",
  "the fillmore", "fillmore", "bottlerock", "the roxy",
  "troubadour", "whisky a go go", "the observatory",
  "music hall", "first avenue", "930 club", "9:30 club",
  "the anthem", "brooklyn bowl",
];

export function classifyVenueType(venueName: string, eventType?: string): VenueType {
  const name = venueName.toLowerCase().trim();

  // Check specific keyword lists (most specific first)
  if (CLUB_KEYWORDS.some(k => name.includes(k))) return "club";
  if (AMPHITHEATER_KEYWORDS.some(k => name.includes(k))) return "amphitheater";
  if (THEATER_KEYWORDS.some(k => name.includes(k))) return "theater";
  if (STADIUM_KEYWORDS.some(k => name.includes(k))) return "stadium";
  if (ARENA_KEYWORDS.some(k => name.includes(k))) return "arena";

  // Fall back to event type hints
  if (eventType) {
    const et = eventType.toLowerCase();
    if (et === "theater" || et === "comedy") return "theater";
    if (et === "sports") return "arena"; // most sports are in arenas
    if (et === "concert" || et === "festival") return "arena";
  }

  return "generic";
}


// ═══════════════════════════════════════════════════════════════════
// VENUE LAYOUT GENERATORS BY TYPE
// ═══════════════════════════════════════════════════════════════════

function generateByType(venueType: VenueType, name: string, eventType?: string): VenueLayout {
  const isConcert = eventType === "concert" || eventType === "festival";
  const isSports = eventType === "sports" || eventType === "game";

  switch (venueType) {
    case "arena":
      return generateArena(name, isConcert ? "STAGE" : isSports ? "COURT" : "STAGE");
    case "stadium":
      return generateStadium(name, isSports ? "FIELD" : "STAGE");
    case "theater":
      return generateTheater(name);
    case "amphitheater":
      return generateAmphitheater(name);
    case "club":
      return generateClub(name);
    default:
      return generateArena(name, "STAGE"); // default to arena since most events are there
  }
}


// ═══════════════════════════════════════════════════════════════════
// HARDCODED OVERRIDES (for venues needing specific layouts)
// ═══════════════════════════════════════════════════════════════════

const VENUE_OVERRIDES: Record<string, { type: VenueType; stageLabel?: string }> = {
  "madison square garden": { type: "arena", stageLabel: "COURT" },
  "msg": { type: "arena", stageLabel: "COURT" },
  "crypto.com arena": { type: "arena" },
  "staples center": { type: "arena" },
  "red rocks amphitheatre": { type: "amphitheater" },
  "hollywood bowl": { type: "amphitheater" },
  "radio city music hall": { type: "theater" },
  "carnegie hall": { type: "theater" },
};


// ═══════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════

/**
 * Get or auto-generate a venue layout.
 *
 * @param venueName  - The venue name (e.g., "Crypto.com Arena")
 * @param eventType  - Optional event type hint ("concert", "sports", etc.)
 * @param layoutType - Optional pre-classified layout type from DB
 */
export function getVenueLayout(
  venueName: string,
  eventType?: string,
  layoutType?: VenueType | null,
): VenueLayout {
  const key = venueName.toLowerCase().trim();

  // Check for hardcoded override first
  const override = VENUE_OVERRIDES[key] ??
    Object.entries(VENUE_OVERRIDES).find(([k]) => key.includes(k) || k.includes(key))?.[1];

  if (override) {
    return generateByType(override.type, venueName, eventType);
  }

  // Use stored layout type if available
  if (layoutType) {
    return generateByType(layoutType, venueName, eventType);
  }

  // Auto-classify
  const venueType = classifyVenueType(venueName, eventType);
  return generateByType(venueType, venueName, eventType);
}

// Fallback: generate a generic layout from ticket section data
export function generateGenericLayout(sections: string[]): VenueLayout {
  const unique = [...new Set(sections)].sort();
  const defs: SectionDef[] = [];
  const cx = 500, cy = 400;
  const count = unique.length;
  const radius = Math.min(300, 100 + count * 15);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    defs.push({
      id: unique[i], label: unique[i],
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      width: 55, height: 30,
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
    tierColors: {
      floor: "#f59e0b", lower: "#6366f1",
      premier: "#8b5cf6", upper: "#64748b",
    },
  };
}

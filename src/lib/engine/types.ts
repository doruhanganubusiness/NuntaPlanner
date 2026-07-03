/**
 * Calculation Engine — tipuri de input/output.
 *
 * Modul TypeScript PUR: fără dependențe de DB, Next.js sau Supabase.
 * Oglindește modelul de date din secțiunea 3 a specificației, dar lucrează
 * doar cu forma de date necesară calculelor (secțiunea 5).
 */

/** Tipul unui slot din programul zilei (event_slots.slot_type). */
export type SlotType =
  | "civil_ceremony"
  | "religious_ceremony"
  | "baptism"
  | "reception";

/** Modul de tratare a băuturii ales de miri (weddings.drink_mode). */
export type DrinkMode = "quantities" | "cost";

/** Opțiunea de muzică (recomandare sau alegerea manuală a mirilor). */
export type MusicChoice = "dj" | "band" | "band_and_dj";

/** Categoriile de buget pentru alocare (secțiunea 5.6). */
export type BudgetCategoryKey =
  | "venue_catering"
  | "music"
  | "photo_video"
  | "decor_flowers"
  | "attire"
  | "drinks"
  | "invitations_favors_cake"
  | "misc";

/** Un slot al evenimentului, așa cum e nevoie de el în calcule. */
export interface SlotInput {
  id?: string;
  slot_type: SlotType;
  title?: string;
  /** Durata în minute — relevantă mai ales pentru petrecere (consum băutură). */
  duration_minutes?: number | null;
  guests_adults?: number | null;
  guests_children?: number | null;
  /** Se servește alcool la acest slot? */
  serves_alcohol?: boolean;
  /** Masă completă (true doar la petrecere). */
  serves_full_meal?: boolean;
}

/** Starea evenimentului (nunta) transmisă motorului. */
export interface WeddingInput {
  /** Județ/oraș — folosit pentru a alege overrides de config pe regiune. */
  region?: string | null;
  /** Buget total în RON (opțional). */
  total_budget?: number | null;
  currency?: string;
  /** „quantities" (mirii aduc băutura) sau „cost" (inclusă în meniu). */
  drink_mode?: DrinkMode;
  /**
   * Ordinea priorităților pe categorii, cea mai importantă prima.
   * Ajustează procentele implicite din alocarea bugetului.
   */
  budget_priorities?: BudgetCategoryKey[] | null;
  /** Alegerea manuală a mirilor pentru muzică (suprascrie recomandarea). */
  music_choice?: MusicChoice | null;
  slots?: SlotInput[];
}

/* ------------------------------------------------------------------ */
/*                               CONFIG                                */
/* ------------------------------------------------------------------ */

/**
 * Toate constantele motorului. Oglindesc `config_parameters` din DB și pot fi
 * suprascrise pe regiune. NIMIC nu e hardcodat în logica de calcul.
 */
export interface EngineConfig {
  // --- băutură: cantități (5.1) ---
  avgDrinksPerAdultPerHour: number; // 0.75 băuturi standard/oră/adult
  drinkSplit: { wine: number; beer: number; spirits: number }; // 0.40 / 0.20 / 0.15
  wineServingMl: number; // 150 ml/pahar
  beerBottleMl: number; // 330 ml/sticlă
  spiritsServingMl: number; // 50 ml/porție
  wineBottleL: number; // 0.75 L/sticlă
  spiritsBottleL: number; // 0.70 L/sticlă
  waterLPerPersonPerHour: number; // 0.5 L/persoană/oră
  juiceLPerPersonPerHour: number; // 0.3 L/persoană/oră
  champagnePersonsPerBottle: number; // 7 (interval 6–8)
  safetyBufferPct: number; // 0.10 buffer de siguranță
  // pahare (5.1 pas 3)
  glassesWinePerAdult: number; // 1.5
  glassesSpiritsPerAdult: number; // 0.8
  glassesWaterPerPerson: number; // 1.5

  // --- băutură: cost (5.2) ---
  drinkCostPerPersonRON: number; // pret_bautura_inclusa (regional)

  // --- dulciuri / tort (5.3) ---
  cakeGramsPerPerson: number; // 120 g
  candyBarKgPerPerson: number; // 0.15 kg
  civilSweetsKgPerGuest: number; // 0.10 kg

  // --- sală (5.4) ---
  venueSqmFactor: number; // 1.8 mp/invitat
  venueSqmMin: number; // 1.5
  venueSqmMax: number; // 2.0
  guestsPerTable: number; // 10

  // --- muzică (5.5) ---
  musicBudgetPct: number; // 0.09
  bandCostRON: number; // cost_formatie (regional)
  djCostRON: number; // cost_dj (regional)
  bandGuestThresholdLow: number; // 80
  bandGuestThresholdHigh: number; // 200

  // --- alocare buget (5.6) ---
  // Profil implicit (DJ) și profil cu formație live (muzica are pondere mai mare).
  budgetAllocation: Record<BudgetCategoryKey, number>;
  budgetAllocationBand: Record<BudgetCategoryKey, number>;
  budgetAllocationBandDj: Record<BudgetCategoryKey, number>;

  // --- buget recomandat ---
  cateringTypicalPerPersonRON: number; // cost tipic/persoană catering (regional)

  // --- sanity checks (5.7) ---
  cateringMinPerPersonRON: number; // prag_minim_regiune
}

/** Overrides parțiale de config, ex. per regiune. */
export type EngineConfigOverride = Partial<
  Omit<EngineConfig, "drinkSplit" | "budgetAllocation">
> & {
  drinkSplit?: Partial<EngineConfig["drinkSplit"]>;
  budgetAllocation?: Partial<EngineConfig["budgetAllocation"]>;
};

/* ------------------------------------------------------------------ */
/*                               OUTPUT                               */
/* ------------------------------------------------------------------ */

export interface DrinkQuantities {
  /** Adulți luați în calcul (sumă pe sloturile cu alcool). */
  adults: number;
  children: number;
  partyHours: number;
  totalStandardDrinks: number;
  wine: { drinks: number; liters: number; bottles: number };
  beer: { drinks: number; bottles: number };
  spirits: { drinks: number; liters: number; bottles: number };
  water: { liters: number };
  juice: { liters: number };
  champagne: { bottles: number };
  glasses: { wine: number; champagne: number; water: number; spirits: number };
}

export interface DrinksResult {
  mode: DrinkMode;
  /** Prezent când mode === "quantities". */
  quantities?: DrinkQuantities;
  /** Prezent când mode === "cost". */
  cost?: { perPersonRON: number; totalRON: number; adults: number };
}

export interface SlotSweets {
  slotId?: string;
  slotType: SlotType;
  title?: string;
  adults: number;
  children: number;
  cakeKg?: number;
  candyBarKg?: number;
  civilSweetsKg?: number;
  champagneBottles?: number;
  glasses?: number;
}

export interface SweetsResult {
  perSlot: SlotSweets[];
  totals: {
    cakeKg: number;
    candyBarKg: number;
    civilSweetsKg: number;
    champagneBottles: number;
  };
}

export interface VenueResult {
  slotId?: string;
  guests: number;
  recommendedSqm: number;
  minSqm: number;
  maxSqm: number;
  roundTables: number;
}

export type MusicRecommendation = MusicChoice;

export interface MusicResult {
  guests: number;
  /** Ce recomandă platforma în funcție de mărimea nunții. */
  recommendation: MusicRecommendation;
  /** Alegerea efectivă (override-ul mirilor dacă există, altfel recomandarea). */
  selected: MusicRecommendation;
  /** True dacă mirii au suprascris recomandarea. */
  overridden: boolean;
  musicBudgetRON: number | null;
  reason: string;
}

export interface BudgetCategoryAllocation {
  key: BudgetCategoryKey;
  label: string;
  pct: number;
  amountRON: number | null;
}

export interface BudgetResult {
  /** Bugetul introdus de miri (null dacă nu au completat). */
  totalBudgetRON: number | null;
  /** Bugetul recomandat de platformă în funcție de invitați și necesități. */
  recommendedTotalRON: number | null;
  /** Bugetul folosit pentru alocare = cel introdus, altfel cel recomandat. */
  effectiveTotalRON: number | null;
  /** True dacă alocarea se bazează pe bugetul recomandat (mirii nu au introdus unul). */
  usingRecommended: boolean;
  allocations: BudgetCategoryAllocation[];
}

export interface EngineResult {
  drinks: DrinksResult;
  sweets: SweetsResult;
  venue: VenueResult | null;
  music: MusicResult | null;
  budget: BudgetResult | null;
  warnings: string[];
  notes: string[];
  inputHash: string;
  computedAt: string;
}

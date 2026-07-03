import type {
  BudgetCategoryKey,
  EngineConfig,
  EngineConfigOverride,
} from "./types";

/** Etichete umane pentru categoriile de buget (secțiunea 5.6). */
export const BUDGET_LABELS: Record<BudgetCategoryKey, string> = {
  venue_catering: "Locație + Catering",
  music: "Muzică",
  photo_video: "Foto-Video",
  decor_flowers: "Decor + Flori",
  attire: "Ținute",
  drinks: "Băutură",
  invitations_favors_cake: "Invitații + mărturii + tort",
  misc: "Diverse / Neprevăzute",
};

/**
 * Config implicit — valorile din secțiunea 5 a specificației.
 * Costurile în RON sunt estimări de pornire; se suprascriu pe regiune
 * din `config_parameters` (DB).
 */
export const DEFAULT_CONFIG: EngineConfig = {
  // băutură — cantități (5.1)
  avgDrinksPerAdultPerHour: 0.75,
  drinkSplit: { wine: 0.4, beer: 0.2, spirits: 0.15 },
  wineServingMl: 150,
  beerBottleMl: 330,
  spiritsServingMl: 50,
  wineBottleL: 0.75,
  spiritsBottleL: 0.7,
  waterLPerPersonPerHour: 0.5,
  juiceLPerPersonPerHour: 0.3,
  champagnePersonsPerBottle: 7,
  safetyBufferPct: 0.1,
  glassesWinePerAdult: 1.5,
  glassesSpiritsPerAdult: 0.8,
  glassesWaterPerPerson: 1.5,

  // băutură — cost (5.2)
  drinkCostPerPersonRON: 60,

  // dulciuri / tort (5.3)
  cakeGramsPerPerson: 120,
  candyBarKgPerPerson: 0.15,
  civilSweetsKgPerGuest: 0.1,

  // sală (5.4)
  venueSqmFactor: 1.8,
  venueSqmMin: 1.5,
  venueSqmMax: 2.0,
  guestsPerTable: 10,

  // muzică (5.5)
  musicBudgetPct: 0.09,
  bandCostRON: 12000,
  djCostRON: 4000,
  bandGuestThresholdLow: 80,
  bandGuestThresholdHigh: 200,

  // alocare buget (5.6) — sumă = 1.00 (băutura inclusă doar dacă mod `cost`)
  budgetAllocation: {
    venue_catering: 0.48,
    music: 0.09,
    photo_video: 0.11,
    decor_flowers: 0.09,
    attire: 0.08,
    drinks: 0.06,
    invitations_favors_cake: 0.05,
    misc: 0.04,
  },

  // sanity checks (5.7)
  cateringMinPerPersonRON: 150,
};

/**
 * Combină config-ul implicit cu overrides (ex. valori regionale din DB).
 * Face merge shallow, cu grijă la obiectele imbricate (`drinkSplit`,
 * `budgetAllocation`).
 */
export function resolveConfig(override?: EngineConfigOverride): EngineConfig {
  if (!override) return DEFAULT_CONFIG;
  return {
    ...DEFAULT_CONFIG,
    ...override,
    drinkSplit: { ...DEFAULT_CONFIG.drinkSplit, ...override.drinkSplit },
    budgetAllocation: {
      ...DEFAULT_CONFIG.budgetAllocation,
      ...override.budgetAllocation,
    },
  };
}

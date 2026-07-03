import type {
  DrinkMode,
  DrinkQuantities,
  DrinksResult,
  EngineConfig,
  SlotInput,
  WeddingInput,
} from "./types";
import { ceil, num, round } from "./util";

const hoursOf = (s: SlotInput) => num(s.duration_minutes) / 60;

/** Sloturile de petrecere la care se servește alcool (baza cantităților). */
function partySlots(input: WeddingInput): SlotInput[] {
  return (input.slots ?? []).filter(
    (s) => s.slot_type === "reception" && s.serves_alcohol === true,
  );
}

/**
 * Băutură — mod `quantities` (secțiunea 5.1).
 * Agregă cantitățile peste toate sloturile de petrecere cu alcool.
 * Buffer de siguranță +10% aplicat cantităților fizice (litri, sticle, pahare).
 */
function computeQuantities(
  input: WeddingInput,
  cfg: EngineConfig,
): DrinkQuantities {
  const buffer = (x: number) => x * (1 + cfg.safetyBufferPct);
  const slots = partySlots(input);

  let adults = 0;
  let children = 0;
  let partyHours = 0;
  let totalStd = 0;
  let waterL = 0;
  let juiceL = 0;
  let champagneRaw = 0;
  let gWine = 0;
  let gChampagne = 0;
  let gWater = 0;
  let gSpirits = 0;

  for (const s of slots) {
    const a = num(s.guests_adults);
    const c = num(s.guests_children);
    const h = hoursOf(s);
    const persons = a + c;

    adults += a;
    children += c;
    partyHours += h;

    // Pas 1 — băuturi standard echivalente
    totalStd += a * cfg.avgDrinksPerAdultPerHour * h;

    // Apă / sucuri (per persoană / oră)
    waterL += persons * cfg.waterLPerPersonPerHour * h;
    juiceL += persons * cfg.juiceLPerPersonPerHour * h;

    // Șampanie toast (1 sticlă la 6–8 persoane)
    champagneRaw += a / cfg.champagnePersonsPerBottle;

    // Pas 3 — pahare
    gWine += a * cfg.glassesWinePerAdult;
    gChampagne += a;
    gWater += persons * cfg.glassesWaterPerPerson;
    gSpirits += a * cfg.glassesSpiritsPerAdult;
  }

  // Pas 2 — defalcare pe sortimente
  const wineDrinks = totalStd * cfg.drinkSplit.wine;
  const beerDrinks = totalStd * cfg.drinkSplit.beer;
  const spiritsDrinks = totalStd * cfg.drinkSplit.spirits;

  const wineLiters = wineDrinks * (cfg.wineServingMl / 1000);
  const spiritsLiters = spiritsDrinks * (cfg.spiritsServingMl / 1000);

  return {
    adults,
    children,
    partyHours: round(partyHours, 2),
    totalStandardDrinks: round(totalStd, 2),
    wine: {
      drinks: round(wineDrinks, 2),
      liters: round(buffer(wineLiters), 2),
      bottles: ceil(buffer(wineLiters) / cfg.wineBottleL),
    },
    beer: {
      drinks: round(beerDrinks, 2),
      // o sticlă (330 ml) per băutură standard de bere
      bottles: ceil(buffer(beerDrinks)),
    },
    spirits: {
      drinks: round(spiritsDrinks, 2),
      liters: round(buffer(spiritsLiters), 2),
      bottles: ceil(buffer(spiritsLiters) / cfg.spiritsBottleL),
    },
    water: { liters: round(buffer(waterL), 2) },
    juice: { liters: round(buffer(juiceL), 2) },
    champagne: { bottles: ceil(buffer(champagneRaw)) },
    glasses: {
      wine: ceil(buffer(gWine)),
      champagne: ceil(buffer(gChampagne)),
      water: ceil(buffer(gWater)),
      spirits: ceil(buffer(gSpirits)),
    },
  };
}

/**
 * Băutură — mod `cost` (secțiunea 5.2).
 * Cost pe persoană (regional) × adulți la petrecere.
 */
function computeCost(input: WeddingInput, cfg: EngineConfig) {
  const adults = (input.slots ?? [])
    .filter((s) => s.slot_type === "reception")
    .reduce((sum, s) => sum + num(s.guests_adults), 0);
  const perPersonRON = cfg.drinkCostPerPersonRON;
  return {
    perPersonRON: round(perPersonRON, 2),
    totalRON: round(adults * perPersonRON, 2),
    adults,
  };
}

export function computeDrinks(
  input: WeddingInput,
  cfg: EngineConfig,
): DrinksResult {
  const mode: DrinkMode = input.drink_mode ?? "quantities";
  if (mode === "cost") {
    return { mode, cost: computeCost(input, cfg) };
  }
  return { mode, quantities: computeQuantities(input, cfg) };
}

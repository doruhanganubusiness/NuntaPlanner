/**
 * Calculation Engine — punct de intrare.
 *
 * `computeWedding` primește starea evenimentului (+ overrides de config opționale)
 * și returnează toate recomandările. Funcție PURĂ și deterministă: aceleași inputuri
 * dau mereu același rezultat (mai puțin `computedAt`), deci `inputHash` poate cache-ui
 * rezultatul în `calc_results`.
 */
import { computeBudget } from "./budget";
import { resolveConfig } from "./config";
import { computeDrinks } from "./drinks";
import { stableHash } from "./hash";
import { computeMusic } from "./music";
import { computeSanity } from "./sanity";
import { computeSweets } from "./sweets";
import type {
  EngineConfigOverride,
  EngineResult,
  WeddingInput,
} from "./types";
import { computeVenue } from "./venue";

export function computeWedding(
  input: WeddingInput,
  configOverride?: EngineConfigOverride,
): EngineResult {
  const cfg = resolveConfig(configOverride);

  const drinks = computeDrinks(input, cfg);
  const sweets = computeSweets(input, cfg);
  const venue = computeVenue(input, cfg);
  const music = computeMusic(input, cfg);
  const budget = computeBudget(input, cfg, music);
  const { warnings, notes } = computeSanity(input, cfg, budget);

  return {
    drinks,
    sweets,
    venue,
    music,
    budget,
    warnings,
    notes,
    // hash-ul acoperă doar inputul + overrides, nu și timestamp-ul.
    inputHash: stableHash({ input, configOverride: configOverride ?? null }),
    computedAt: new Date().toISOString(),
  };
}

export * from "./types";
export { DEFAULT_CONFIG, resolveConfig, BUDGET_LABELS } from "./config";
export { stableHash } from "./hash";

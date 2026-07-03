import {
  computeWedding,
  type BudgetCategoryKey,
  type EngineConfigOverride,
  type EngineResult,
  type WeddingInput,
} from "@/lib/engine";
import type {
  ConfigParameterRow,
  EventSlotRow,
  WeddingRow,
} from "@/lib/supabase/database.types";

/** Transformă rândurile din DB în inputul așteptat de motor. */
export function toWeddingInput(
  wedding: WeddingRow,
  slots: EventSlotRow[],
): WeddingInput {
  return {
    region: wedding.region,
    total_budget: wedding.total_budget,
    currency: wedding.currency,
    drink_mode: wedding.drink_mode,
    budget_priorities:
      (wedding.budget_priorities as BudgetCategoryKey[] | null) ?? null,
    music_choice: wedding.music_choice,
    slots: slots.map((s) => ({
      id: s.id,
      slot_type: s.slot_type,
      title: s.title ?? undefined,
      duration_minutes: s.duration_minutes,
      guests_adults: s.guests_adults,
      guests_children: s.guests_children,
      serves_alcohol: s.serves_alcohol,
      serves_full_meal: s.serves_full_meal,
    })),
  };
}

/**
 * Combină config-ul global (region NULL) cu cel regional din `config_parameters`
 * (ambele sub cheia `engine_config`). Regionalul are prioritate.
 */
export function mergeEngineOverride(
  rows: ConfigParameterRow[],
  region: string | null,
): EngineConfigOverride | undefined {
  const global = rows.find(
    (r) => r.region === null && r.key === "engine_config",
  )?.value;
  const regional = region
    ? rows.find((r) => r.region === region && r.key === "engine_config")?.value
    : undefined;

  const merged = {
    ...((global as object) ?? {}),
    ...((regional as object) ?? {}),
  } as EngineConfigOverride;

  return Object.keys(merged).length > 0 ? merged : undefined;
}

/** Rulează motorul pe rândurile din DB. */
export function runEngine(
  wedding: WeddingRow,
  slots: EventSlotRow[],
  configRows: ConfigParameterRow[],
): EngineResult {
  const input = toWeddingInput(wedding, slots);
  const override = mergeEngineOverride(configRows, wedding.region);
  return computeWedding(input, override);
}

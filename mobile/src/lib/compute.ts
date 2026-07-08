import {
  computeWedding,
  type BudgetCategoryKey,
  type EngineConfigOverride,
  type EngineResult,
  type WeddingInput,
} from "./engine";
import type { ConfigParameterRow, EventSlotRow, WeddingRow } from "./types";

/** Transformă rândurile din DB în inputul motorului (identic cu site-ul). */
function toWeddingInput(wedding: WeddingRow, slots: EventSlotRow[]): WeddingInput {
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

function mergeEngineOverride(
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

/** Rulează motorul pur pe date din DB — calcul identic cu cel de pe site. */
export function runEngine(
  wedding: WeddingRow,
  slots: EventSlotRow[],
  configRows: ConfigParameterRow[],
): EngineResult {
  const input = toWeddingInput(wedding, slots);
  const override = mergeEngineOverride(configRows, wedding.region);
  return computeWedding(input, override);
}

export type { EngineResult };

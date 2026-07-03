import type { EngineConfig, VenueResult, WeddingInput } from "./types";
import { ceil, num, round } from "./util";

/**
 * Dimensiunea sălii / locației pentru petrecere (secțiunea 5.4).
 * Se aplică slotului de petrecere principal (cel cu cei mai mulți invitați).
 * Returnează null dacă nu există slot de petrecere.
 */
export function computeVenue(
  input: WeddingInput,
  cfg: EngineConfig,
): VenueResult | null {
  const receptions = (input.slots ?? []).filter(
    (s) => s.slot_type === "reception",
  );
  if (receptions.length === 0) return null;

  const main = receptions.reduce((best, s) => {
    const g = num(s.guests_adults) + num(s.guests_children);
    const bg = num(best.guests_adults) + num(best.guests_children);
    return g > bg ? s : best;
  });

  const guests = num(main.guests_adults) + num(main.guests_children);

  return {
    slotId: main.id,
    guests,
    recommendedSqm: round(guests * cfg.venueSqmFactor, 1),
    minSqm: round(guests * cfg.venueSqmMin, 1),
    maxSqm: round(guests * cfg.venueSqmMax, 1),
    roundTables: ceil(guests / cfg.guestsPerTable),
  };
}

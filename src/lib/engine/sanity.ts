import type {
  BudgetResult,
  EngineConfig,
  WeddingInput,
} from "./types";
import { num } from "./util";

/**
 * Verificări de fezabilitate (secțiunea 5.7).
 * Emite `warnings` (probleme de rezolvat) și `notes` (informative), niciodată erori.
 */
export function computeSanity(
  input: WeddingInput,
  cfg: EngineConfig,
  budget: BudgetResult,
): { warnings: string[]; notes: string[] } {
  const warnings: string[] = [];
  const notes: string[] = [];
  const slots = input.slots ?? [];

  // Regiune lipsă — critică pentru estimările regionale.
  if (!input.region) {
    notes.push(
      "Regiunea nu e completată — folosim estimări generice. Adaug-o pentru recomandări mai precise.",
    );
  }

  // Buget total lipsă — doar cantități, nu cost.
  if (input.total_budget == null) {
    notes.push(
      "Buget total necompletat — calculăm doar cantități, fără defalcare pe costuri.",
    );
  }

  // Cost catering pe persoană sub pragul regional.
  const receptions = slots.filter((s) => s.slot_type === "reception");
  const receptionGuests = receptions.reduce(
    (sum, s) => sum + num(s.guests_adults) + num(s.guests_children),
    0,
  );
  const catering = budget.allocations.find((a) => a.key === "venue_catering");
  if (
    catering?.amountRON != null &&
    receptionGuests > 0 &&
    catering.amountRON / receptionGuests < cfg.cateringMinPerPersonRON
  ) {
    const perPerson = Math.round(catering.amountRON / receptionGuests);
    warnings.push(
      `Bugetul de locație + catering revine la ~${perPerson} RON/persoană, sub pragul recomandat de ${cfg.cateringMinPerPersonRON} RON. Ia în calcul mai mult buget sau mai puțini invitați.`,
    );
  }

  // Fără slot de petrecere.
  if (receptions.length === 0) {
    notes.push(
      "Nu ai adăugat un slot de petrecere — nu putem estima băutura, sala sau muzica.",
    );
  }

  // Invitați inconsistenți între sloturi (informativ).
  const guestCounts = slots
    .map((s) => num(s.guests_adults) + num(s.guests_children))
    .filter((g) => g > 0);
  if (guestCounts.length > 1) {
    const min = Math.min(...guestCounts);
    const max = Math.max(...guestCounts);
    if (max - min > 0) {
      notes.push(
        `Numărul de invitați diferă între sloturi (${min}–${max}). E normal (ex. mai puțini la cununia civilă), dar verifică să fie intenționat.`,
      );
    }
  }

  return { warnings, notes };
}

import { BUDGET_LABELS } from "./config";
import type {
  BudgetCategoryAllocation,
  BudgetCategoryKey,
  BudgetResult,
  EngineConfig,
  MusicResult,
  WeddingInput,
} from "./types";
import { ceil, num, round } from "./util";

/** Cât de mult influențează prioritizarea drag&drop procentele (0..1). */
const PRIORITY_STRENGTH = 0.15;

/** Profilul de alocare în funcție de alegerea efectivă de muzică. */
function profileFor(cfg: EngineConfig, music: MusicResult | null) {
  const sel = music?.selected ?? "dj";
  if (sel === "band_and_dj") return cfg.budgetAllocationBandDj;
  if (sel === "band") return cfg.budgetAllocationBand;
  return cfg.budgetAllocation;
}

function receptionGuests(input: WeddingInput): number {
  return (input.slots ?? [])
    .filter((s) => s.slot_type === "reception")
    .reduce((sum, s) => sum + num(s.guests_adults) + num(s.guests_children), 0);
}

/**
 * Buget recomandat de platformă (secțiunea 5.6 extinsă).
 * Ancorat pe costul de catering (invitați × cost/persoană regional), astfel încât
 * locația + cateringul să reprezinte ponderea-țintă (> 51%) din total.
 * Returnează null dacă nu există petrecere.
 */
function recommendedTotal(
  input: WeddingInput,
  cfg: EngineConfig,
  music: MusicResult | null,
): number | null {
  const guests = receptionGuests(input);
  if (guests <= 0) return null;
  const cateringCost = guests * cfg.cateringTypicalPerPersonRON;
  const profile = profileFor(cfg, music);
  const raw = cateringCost / profile.venue_catering;
  // rotunjire în sus la 1.000 RON
  return Math.ceil(raw / 1000) * 1000;
}

/**
 * Alocarea bugetului pe categorii (secțiunea 5.6).
 *
 * - Profil dinamic: cu formație live muzica primește o pondere mai mare (~11%),
 *   cu DJ mai mică (~6%); locația rămâne > 51%.
 * - Băutura e inclusă doar în modul `cost`.
 * - Se folosește bugetul introdus de miri; dacă lipsește, cel recomandat.
 * - Prioritizarea mută ușor procentele, apoi totul se renormalizează la 100%.
 */
export function computeBudget(
  input: WeddingInput,
  cfg: EngineConfig,
  music: MusicResult | null,
): BudgetResult {
  const userTotal =
    input.total_budget != null && input.total_budget > 0
      ? num(input.total_budget)
      : null;
  const recommended = recommendedTotal(input, cfg, music);
  const effective = userTotal ?? recommended;
  const usingRecommended = userTotal == null && recommended != null;

  const mode = input.drink_mode ?? "quantities";
  const profile = profileFor(cfg, music);

  const keys = (Object.keys(profile) as BudgetCategoryKey[]).filter(
    (k) => !(k === "drinks" && mode !== "cost"),
  );

  // Multiplicatori din prioritizare: centrat pe 1, top +, coadă -.
  const priorities = input.budget_priorities ?? [];
  const m = priorities.length;
  const mult = new Map<BudgetCategoryKey, number>(keys.map((k) => [k, 1]));
  if (m > 1) {
    priorities.forEach((k, i) => {
      if (!mult.has(k)) return;
      const centered = ((m - 1) / 2 - i) / ((m - 1) / 2);
      mult.set(k, 1 + PRIORITY_STRENGTH * centered);
    });
  }

  const weighted = keys.map((k) => ({ k, w: profile[k] * (mult.get(k) ?? 1) }));
  const sumW = weighted.reduce((s, x) => s + x.w, 0);

  const allocations: BudgetCategoryAllocation[] = weighted.map(({ k, w }) => {
    const pct = w / sumW;
    return {
      key: k,
      label: BUDGET_LABELS[k],
      pct: round(pct, 4),
      amountRON: effective != null ? round(effective * pct, 2) : null,
    };
  });

  return {
    totalBudgetRON: userTotal,
    recommendedTotalRON: recommended,
    effectiveTotalRON: effective,
    usingRecommended,
    allocations,
  };
}

// exportat pentru testare directă
export { recommendedTotal, receptionGuests };

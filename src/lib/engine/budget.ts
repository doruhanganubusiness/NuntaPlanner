import { BUDGET_LABELS } from "./config";
import type {
  BudgetCategoryAllocation,
  BudgetCategoryKey,
  EngineConfig,
  BudgetResult,
  WeddingInput,
} from "./types";
import { num, round } from "./util";

/** Cât de mult influențează prioritizarea drag&drop procentele (0..1). */
const PRIORITY_STRENGTH = 0.15;

/**
 * Alocarea bugetului pe categorii (secțiunea 5.6).
 *
 * - Pornește de la procentele implicite din config.
 * - Categoria „Băutură" e inclusă doar în modul `cost` (altfel băutura e calculată
 *   ca și cantități, nu ca linie de buget).
 * - Prioritizarea mirilor (`budget_priorities`, cea mai importantă prima) mută ușor
 *   procentele spre categoriile favorizate, apoi totul se renormalizează la 100%.
 */
export function computeBudget(
  input: WeddingInput,
  cfg: EngineConfig,
): BudgetResult {
  const total = input.total_budget != null ? num(input.total_budget) : null;
  const mode = input.drink_mode ?? "quantities";

  const keys = (
    Object.keys(cfg.budgetAllocation) as BudgetCategoryKey[]
  ).filter((k) => !(k === "drinks" && mode !== "cost"));

  // Multiplicatori din prioritizare: centrat pe 1, top +, coadă -.
  const priorities = input.budget_priorities ?? [];
  const m = priorities.length;
  const mult = new Map<BudgetCategoryKey, number>(keys.map((k) => [k, 1]));
  if (m > 1) {
    priorities.forEach((k, i) => {
      if (!mult.has(k)) return;
      const centered = ((m - 1) / 2 - i) / ((m - 1) / 2); // +1 (top) .. -1 (coadă)
      mult.set(k, 1 + PRIORITY_STRENGTH * centered);
    });
  }

  const weighted = keys.map((k) => ({
    k,
    w: cfg.budgetAllocation[k] * (mult.get(k) ?? 1),
  }));
  const sumW = weighted.reduce((s, x) => s + x.w, 0);

  const allocations: BudgetCategoryAllocation[] = weighted.map(({ k, w }) => {
    const pct = w / sumW;
    return {
      key: k,
      label: BUDGET_LABELS[k],
      pct: round(pct, 4),
      amountRON: total != null ? round(total * pct, 2) : null,
    };
  });

  return { totalBudgetRON: total, allocations };
}

import type {
  EngineConfig,
  MusicRecommendation,
  MusicResult,
  WeddingInput,
} from "./types";
import { num, round } from "./util";

/**
 * Formație vs DJ (secțiunea 5.5).
 * Decizia se bazează pe numărul de invitați la petrecere și pe bugetul de muzică
 * (dacă bugetul total e completat). Fără buget total, recomandarea se face doar
 * pe numărul de invitați și se marchează în `reason`.
 * Returnează null dacă nu există slot de petrecere.
 */
export function computeMusic(
  input: WeddingInput,
  cfg: EngineConfig,
): MusicResult | null {
  const receptions = (input.slots ?? []).filter(
    (s) => s.slot_type === "reception",
  );
  if (receptions.length === 0) return null;

  const guests = receptions.reduce(
    (sum, s) => sum + num(s.guests_adults) + num(s.guests_children),
    0,
  );

  const hasBudget = input.total_budget != null && input.total_budget > 0;
  const musicBudget = hasBudget
    ? round(num(input.total_budget) * cfg.musicBudgetPct, 2)
    : null;

  const { bandCostRON: band, djCostRON: dj } = cfg;
  const { bandGuestThresholdLow: low, bandGuestThresholdHigh: high } = cfg;

  let recommendation: MusicRecommendation;
  let reason: string;

  if (musicBudget == null) {
    // Fără buget: decidem pe număr de invitați.
    if (guests < low) {
      recommendation = "dj";
      reason = `Sub ${low} invitați — un DJ este suficient (buget total necompletat).`;
    } else if (guests <= high) {
      recommendation = "band_and_dj";
      reason = `${low}–${high} invitați — recomandăm Formație + DJ (buget total necompletat, verifică fezabilitatea).`;
    } else {
      recommendation = "band";
      reason = `Peste ${high} invitați — recomandăm Formație completă (buget total necompletat, verifică fezabilitatea).`;
    }
  } else if (guests < low || musicBudget < dj) {
    recommendation = "dj";
    reason =
      guests < low
        ? `Sub ${low} invitați — un DJ este suficient.`
        : `Bugetul de muzică (${musicBudget} RON) e sub costul estimat al unui DJ (${dj} RON).`;
  } else if (guests <= high && musicBudget >= band) {
    recommendation = "band_and_dj";
    reason = `${low}–${high} invitați și buget de muzică suficient (${musicBudget} ≥ ${band} RON) — Formație + DJ.`;
  } else if (guests > high && musicBudget >= band) {
    recommendation = "band";
    reason = `Peste ${high} invitați și buget de muzică suficient (${musicBudget} ≥ ${band} RON) — Formație completă.`;
  } else {
    recommendation = "dj_budget_limited";
    reason = `Bugetul de muzică (${musicBudget} RON) e insuficient pentru o formație (${band} RON) — recomandăm DJ.`;
  }

  return {
    guests,
    musicBudgetRON: musicBudget,
    bandCostRON: band,
    djCostRON: dj,
    recommendation,
    reason,
  };
}

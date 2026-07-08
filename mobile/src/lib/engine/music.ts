import type {
  EngineConfig,
  MusicRecommendation,
  MusicResult,
  WeddingInput,
} from "./types";
import { num, round } from "./util";

const LABELS: Record<MusicRecommendation, string> = {
  dj: "DJ",
  band: "Formație",
  band_and_dj: "Formație + DJ",
};

/**
 * Recomandarea de muzică (secțiunea 5.5) — pe mărimea nunții:
 *   ≤ prag_jos            → DJ
 *   prag_jos .. prag_sus  → Formație
 *   > prag_sus            → Formație + DJ
 * Mirii pot suprascrie prin `music_choice`; bugetul se ajustează în consecință.
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

  const { bandGuestThresholdLow: low, bandGuestThresholdHigh: high } = cfg;

  let recommendation: MusicRecommendation;
  if (guests <= low) recommendation = "dj";
  else if (guests <= high) recommendation = "band";
  else recommendation = "band_and_dj";

  const overridden =
    input.music_choice != null && input.music_choice !== recommendation;
  const selected = input.music_choice ?? recommendation;

  const hasBudget = input.total_budget != null && input.total_budget > 0;
  const musicBudget = hasBudget
    ? round(num(input.total_budget) * cfg.musicBudgetPct, 2)
    : null;

  const reason = overridden
    ? `Ai ales ${LABELS[selected]} (noi recomandam ${LABELS[recommendation]} pentru ${guests} invitați).`
    : guests <= low
      ? `Până în ${low} invitați — un DJ este suficient.`
      : guests <= high
        ? `Între ${low} și ${high} invitați — recomandăm o formație live.`
        : `Peste ${high} invitați — recomandăm formație + DJ pentru energie toată noaptea.`;

  return {
    guests,
    recommendation,
    selected,
    overridden,
    musicBudgetRON: musicBudget,
    reason,
  };
}

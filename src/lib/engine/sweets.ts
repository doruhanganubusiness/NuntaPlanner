import type {
  EngineConfig,
  SlotSweets,
  SweetsResult,
  WeddingInput,
} from "./types";
import { ceil, num, round } from "./util";

/**
 * Dulciuri / candy bar / tort / șampanie ceremonie (secțiunea 5.3).
 *
 * - La petrecere (reception): tort + candy bar (calculat pe adulți + copii).
 * - La ceremonii (civilă / religioasă / botez): dulciuri, șampanie de toast și
 *   pahare (formulele „_civil" din spec, generalizate la orice ceremonie).
 */
export function computeSweets(
  input: WeddingInput,
  cfg: EngineConfig,
): SweetsResult {
  const perSlot: SlotSweets[] = [];
  const totals = {
    cakeKg: 0,
    candyBarKg: 0,
    civilSweetsKg: 0,
    champagneBottles: 0,
  };

  for (const s of input.slots ?? []) {
    const a = num(s.guests_adults);
    const c = num(s.guests_children);
    const guests = a + c;

    const entry: SlotSweets = {
      slotId: s.id,
      slotType: s.slot_type,
      title: s.title,
      adults: a,
      children: c,
    };

    if (s.slot_type === "reception") {
      const cakeKg = ceil((guests * cfg.cakeGramsPerPerson) / 1000);
      const candyBarKg = round(guests * cfg.candyBarKgPerPerson, 2);
      entry.cakeKg = cakeKg;
      entry.candyBarKg = candyBarKg;
      totals.cakeKg += cakeKg;
      totals.candyBarKg += candyBarKg;
    } else {
      // civil_ceremony / religious_ceremony / baptism
      const civilSweetsKg = round(guests * cfg.civilSweetsKgPerGuest, 2);
      const champagneBottles = ceil(a / cfg.champagnePersonsPerBottle);
      entry.civilSweetsKg = civilSweetsKg;
      entry.champagneBottles = champagneBottles;
      entry.glasses = a;
      totals.civilSweetsKg += civilSweetsKg;
      totals.champagneBottles += champagneBottles;
    }

    perSlot.push(entry);
  }

  return {
    perSlot,
    totals: {
      cakeKg: totals.cakeKg,
      candyBarKg: round(totals.candyBarKg, 2),
      civilSweetsKg: round(totals.civilSweetsKg, 2),
      champagneBottles: totals.champagneBottles,
    },
  };
}

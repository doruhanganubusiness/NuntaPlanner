import { describe, expect, it } from "vitest";
import { computeWedding } from "../index";
import type { WeddingInput } from "../types";

/** Nuntă completă: cununie civilă + religioasă + petrecere. */
const wedding: WeddingInput = {
  region: "Cluj",
  total_budget: 200000,
  drink_mode: "quantities",
  slots: [
    { slot_type: "civil_ceremony", title: "Cununia civilă", guests_adults: 40 },
    {
      slot_type: "religious_ceremony",
      title: "Cununia religioasă",
      guests_adults: 130,
      guests_children: 20,
    },
    {
      slot_type: "reception",
      title: "Petrecerea",
      duration_minutes: 600,
      guests_adults: 130,
      guests_children: 20,
      serves_alcohol: true,
      serves_full_meal: true,
    },
  ],
};

describe("computeWedding — integrare", () => {
  const res = computeWedding(wedding);

  it("produce toate secțiunile de rezultat", () => {
    expect(res.drinks).toBeDefined();
    expect(res.sweets).toBeDefined();
    expect(res.venue).not.toBeNull();
    expect(res.music).not.toBeNull();
    expect(res.budget).toBeDefined();
    expect(Array.isArray(res.warnings)).toBe(true);
    expect(Array.isArray(res.notes)).toBe(true);
  });

  it("băutura se bazează pe slotul de petrecere", () => {
    // 130 × 0.75 × 10 = 975
    expect(res.drinks.quantities!.totalStandardDrinks).toBe(975);
    expect(res.drinks.quantities!.adults).toBe(130);
  });

  it("sala e calculată pe petrecere (150 invitați)", () => {
    expect(res.venue!.guests).toBe(150);
    expect(res.venue!.roundTables).toBe(15);
  });

  it("muzica ține cont de buget și invitați", () => {
    expect(res.music!.guests).toBe(150);
    // 150 invitați → între 100 și 300 → Formație
    expect(res.music!.recommendation).toBe("band");
  });

  it("dulciurile acoperă și ceremoniile, și petrecerea", () => {
    expect(res.sweets.perSlot).toHaveLength(3);
    expect(res.sweets.totals.cakeKg).toBeGreaterThan(0);
    expect(res.sweets.totals.champagneBottles).toBeGreaterThan(0);
  });

  it("este determinist: același input → același inputHash", () => {
    const a = computeWedding(wedding);
    const b = computeWedding(wedding);
    expect(a.inputHash).toBe(b.inputHash);
  });

  it("input diferit → inputHash diferit", () => {
    const other = computeWedding({ ...wedding, total_budget: 250000 });
    expect(other.inputHash).not.toBe(res.inputHash);
  });

  it("respectă overrides de config (praguri de invitați)", () => {
    // ridicăm pragul → 150 invitați devin „DJ"
    const res2 = computeWedding(wedding, { bandGuestThresholdLow: 200 });
    expect(res2.music!.recommendation).toBe("dj");
  });

  it("mirii pot suprascrie muzica, iar bugetul se schimbă", () => {
    const rec = computeWedding(wedding); // 150 → band
    const overridden = computeWedding({ ...wedding, music_choice: "dj" });
    expect(overridden.music!.selected).toBe("dj");
    const musicRec = rec.budget!.allocations.find((a) => a.key === "music")!.pct;
    const musicDj = overridden.budget!.allocations.find(
      (a) => a.key === "music",
    )!.pct;
    // DJ are pondere de muzică mai mică decât formația
    expect(musicDj).toBeLessThan(musicRec);
  });
});

describe("computeWedding — edge cases", () => {
  it("input gol nu aruncă erori", () => {
    const res = computeWedding({});
    expect(res.venue).toBeNull();
    expect(res.music).toBeNull();
    expect(res.warnings).toBeDefined();
    expect(res.notes.length).toBeGreaterThan(0);
  });

  it("durată lipsă la petrecere → 0 băuturi, fără crash", () => {
    const res = computeWedding({
      drink_mode: "quantities",
      slots: [
        { slot_type: "reception", guests_adults: 100, serves_alcohol: true },
      ],
    });
    expect(res.drinks.quantities!.totalStandardDrinks).toBe(0);
  });
});

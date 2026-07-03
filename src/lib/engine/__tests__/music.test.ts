import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../config";
import { computeMusic } from "../music";
import type { WeddingInput } from "../types";

const reception = (guests: number): WeddingInput["slots"] => [
  { slot_type: "reception", guests_adults: guests },
];

describe("computeMusic (5.5)", () => {
  it("sub 80 invitați → DJ", () => {
    const res = computeMusic(
      { total_budget: 200000, slots: reception(60) },
      DEFAULT_CONFIG,
    );
    expect(res!.recommendation).toBe("dj");
  });

  it("80–200 invitați cu buget suficient → Formație + DJ", () => {
    // musicBudget = 200000 × 0.09 = 18000 ≥ 12000 (band)
    const res = computeMusic(
      { total_budget: 200000, slots: reception(120) },
      DEFAULT_CONFIG,
    );
    expect(res!.musicBudgetRON).toBe(18000);
    expect(res!.recommendation).toBe("band_and_dj");
  });

  it("peste 200 invitați cu buget suficient → Formație", () => {
    const res = computeMusic(
      { total_budget: 300000, slots: reception(250) },
      DEFAULT_CONFIG,
    );
    expect(res!.recommendation).toBe("band");
  });

  it("buget insuficient pentru formație → DJ (buget limitat)", () => {
    // musicBudget = 100000 × 0.09 = 9000 < 12000 (band), dar ≥ dj (4000)
    const res = computeMusic(
      { total_budget: 100000, slots: reception(120) },
      DEFAULT_CONFIG,
    );
    expect(res!.recommendation).toBe("dj_budget_limited");
  });

  it("buget sub costul DJ → DJ", () => {
    // musicBudget = 40000 × 0.09 = 3600 < 4000 (dj)
    const res = computeMusic(
      { total_budget: 40000, slots: reception(120) },
      DEFAULT_CONFIG,
    );
    expect(res!.recommendation).toBe("dj");
  });

  it("fără buget total → decizie pe număr de invitați", () => {
    const res = computeMusic({ slots: reception(120) }, DEFAULT_CONFIG);
    expect(res!.musicBudgetRON).toBeNull();
    expect(res!.recommendation).toBe("band_and_dj");
  });

  it("returnează null fără slot de petrecere", () => {
    expect(
      computeMusic(
        { slots: [{ slot_type: "civil_ceremony", guests_adults: 30 }] },
        DEFAULT_CONFIG,
      ),
    ).toBeNull();
  });
});

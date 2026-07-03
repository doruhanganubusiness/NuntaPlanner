import { describe, expect, it } from "vitest";
import { computeBudget } from "../budget";
import { DEFAULT_CONFIG } from "../config";
import { computeSanity } from "../sanity";
import type { WeddingInput } from "../types";

function run(input: WeddingInput) {
  const budget = computeBudget(input, DEFAULT_CONFIG);
  return computeSanity(input, DEFAULT_CONFIG, budget);
}

describe("computeSanity (5.7)", () => {
  it("notă când lipsește bugetul total", () => {
    const { notes } = run({
      region: "București",
      slots: [{ slot_type: "reception", guests_adults: 100 }],
    });
    expect(notes.some((n) => n.includes("Buget total necompletat"))).toBe(true);
  });

  it("notă când lipsește regiunea", () => {
    const { notes } = run({
      total_budget: 100000,
      slots: [{ slot_type: "reception", guests_adults: 100 }],
    });
    expect(notes.some((n) => n.toLowerCase().includes("regiune"))).toBe(true);
  });

  it("avertizare când catering/persoană e sub prag", () => {
    // total 10000, cost mode → catering 4800 / 120 = 40 RON/pers < 150
    const { warnings } = run({
      region: "București",
      total_budget: 10000,
      drink_mode: "cost",
      slots: [
        { slot_type: "reception", guests_adults: 100, guests_children: 20 },
      ],
    });
    expect(warnings.some((w) => w.includes("catering"))).toBe(true);
  });

  it("fără avertizare de catering când bugetul e generos", () => {
    const { warnings } = run({
      region: "București",
      total_budget: 200000,
      drink_mode: "cost",
      slots: [
        { slot_type: "reception", guests_adults: 100, guests_children: 20 },
      ],
    });
    expect(warnings.some((w) => w.includes("catering"))).toBe(false);
  });

  it("notă când nu există slot de petrecere", () => {
    const { notes } = run({
      region: "București",
      total_budget: 100000,
      slots: [{ slot_type: "civil_ceremony", guests_adults: 30 }],
    });
    expect(notes.some((n) => n.includes("petrecere"))).toBe(true);
  });
});

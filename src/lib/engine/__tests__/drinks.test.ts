import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../config";
import { computeDrinks } from "../drinks";
import type { WeddingInput } from "../types";

/** Petrecere canonică: 100 adulți, 20 copii, 10 ore, cu alcool. */
const party: WeddingInput = {
  drink_mode: "quantities",
  slots: [
    {
      slot_type: "reception",
      duration_minutes: 600,
      guests_adults: 100,
      guests_children: 20,
      serves_alcohol: true,
    },
  ],
};

describe("computeDrinks — quantities (5.1)", () => {
  const res = computeDrinks(party, DEFAULT_CONFIG);
  const q = res.quantities!;

  it("returnează modul quantities", () => {
    expect(res.mode).toBe("quantities");
    expect(q).toBeDefined();
  });

  it("total băuturi standard = adulți × 0.75 × ore", () => {
    // 100 × 0.75 × 10 = 750
    expect(q.totalStandardDrinks).toBe(750);
    expect(q.partyHours).toBe(10);
  });

  it("vin: 40% × 150ml → sticle 0.75L, cu buffer +10%", () => {
    expect(q.wine.drinks).toBe(300); // 750 × 0.40
    expect(q.wine.liters).toBeCloseTo(49.5, 2); // 45L × 1.1
    expect(q.wine.bottles).toBe(66); // ceil(49.5 / 0.75)
  });

  it("bere: 20% × 330ml → sticle, cu buffer", () => {
    expect(q.beer.drinks).toBe(150);
    expect(q.beer.bottles).toBe(165); // ceil(150 × 1.1)
  });

  it("tărie: 15% × 50ml → sticle 0.7L, cu buffer", () => {
    expect(q.spirits.drinks).toBe(112.5);
    expect(q.spirits.liters).toBeCloseTo(6.19, 2); // 5.625 × 1.1
    expect(q.spirits.bottles).toBe(9); // ceil(6.1875 / 0.7)
  });

  it("apă și sucuri per persoană/oră, cu buffer", () => {
    expect(q.water.liters).toBeCloseTo(660, 1); // 120 × 0.5 × 10 × 1.1
    expect(q.juice.liters).toBeCloseTo(396, 1); // 120 × 0.3 × 10 × 1.1
  });

  it("șampanie: 1 sticlă la ~7 persoane, cu buffer", () => {
    expect(q.champagne.bottles).toBe(16); // ceil(100/7 × 1.1)
  });

  it("pahare (pas 3) cu buffer +10%", () => {
    expect(q.glasses.wine).toBe(165); // ceil(150 × 1.1)
    expect(q.glasses.champagne).toBe(110); // ceil(100 × 1.1)
    expect(q.glasses.water).toBe(198); // ceil(180 × 1.1)
    expect(q.glasses.spirits).toBe(88); // ceil(80 × 1.1)
  });
});

describe("computeDrinks — cost (5.2)", () => {
  it("cost = adulți × preț/persoană regional", () => {
    const res = computeDrinks(
      { ...party, drink_mode: "cost" },
      DEFAULT_CONFIG,
    );
    expect(res.mode).toBe("cost");
    expect(res.cost).toEqual({
      perPersonRON: DEFAULT_CONFIG.drinkCostPerPersonRON,
      totalRON: 100 * DEFAULT_CONFIG.drinkCostPerPersonRON,
      adults: 100,
    });
  });
});

describe("computeDrinks — agregare pe mai multe sloturi", () => {
  it("însumează adulții și orele peste sloturile de petrecere cu alcool", () => {
    const res = computeDrinks(
      {
        drink_mode: "quantities",
        slots: [
          {
            slot_type: "reception",
            duration_minutes: 600,
            guests_adults: 50,
            serves_alcohol: true,
          },
          {
            slot_type: "reception",
            duration_minutes: 600,
            guests_adults: 50,
            serves_alcohol: true,
          },
        ],
      },
      DEFAULT_CONFIG,
    );
    // 2 × (50 × 0.75 × 10) = 750, identic cu slotul unic de 100 adulți
    expect(res.quantities!.totalStandardDrinks).toBe(750);
    expect(res.quantities!.adults).toBe(100);
  });

  it("ignoră sloturile fără alcool sau care nu sunt petrecere", () => {
    const res = computeDrinks(
      {
        drink_mode: "quantities",
        slots: [
          {
            slot_type: "civil_ceremony",
            guests_adults: 100,
            serves_alcohol: true,
          },
          {
            slot_type: "reception",
            duration_minutes: 600,
            guests_adults: 100,
            serves_alcohol: false,
          },
        ],
      },
      DEFAULT_CONFIG,
    );
    expect(res.quantities!.totalStandardDrinks).toBe(0);
  });
});

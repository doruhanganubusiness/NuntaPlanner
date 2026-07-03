import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../config";
import { computeSweets } from "../sweets";
import type { WeddingInput } from "../types";

describe("computeSweets (5.3)", () => {
  it("tort și candy bar pentru petrecere (adulți + copii)", () => {
    const res = computeSweets(
      {
        slots: [
          {
            id: "r1",
            slot_type: "reception",
            guests_adults: 100,
            guests_children: 20,
          },
        ],
      },
      DEFAULT_CONFIG,
    );
    const slot = res.perSlot[0];
    expect(slot.cakeKg).toBe(15); // ceil(120 × 120 / 1000) = ceil(14.4)
    expect(slot.candyBarKg).toBe(18); // 120 × 0.15
    expect(res.totals.cakeKg).toBe(15);
    expect(res.totals.candyBarKg).toBe(18);
  });

  it("dulciuri, șampanie și pahare pentru ceremonie", () => {
    const res = computeSweets(
      {
        slots: [
          {
            slot_type: "civil_ceremony",
            guests_adults: 70,
            guests_children: 0,
          },
        ],
      },
      DEFAULT_CONFIG,
    );
    const slot = res.perSlot[0];
    expect(slot.civilSweetsKg).toBe(7); // 70 × 0.10
    expect(slot.champagneBottles).toBe(10); // ceil(70 / 7)
    expect(slot.glasses).toBe(70);
    expect(res.totals.champagneBottles).toBe(10);
  });

  it("agregă totalurile peste sloturi mixte", () => {
    const input: WeddingInput = {
      slots: [
        { slot_type: "civil_ceremony", guests_adults: 30 },
        {
          slot_type: "reception",
          guests_adults: 100,
          guests_children: 10,
        },
      ],
    };
    const res = computeSweets(input, DEFAULT_CONFIG);
    expect(res.perSlot).toHaveLength(2);
    expect(res.totals.cakeKg).toBe(14); // ceil(110 × 0.12)
    expect(res.totals.civilSweetsKg).toBe(3); // 30 × 0.10
  });
});

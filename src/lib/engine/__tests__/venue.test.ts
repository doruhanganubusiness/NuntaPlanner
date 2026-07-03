import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../config";
import { computeVenue } from "../venue";

describe("computeVenue (5.4)", () => {
  it("suprafață, min/max și mese rotunde pe slotul de petrecere", () => {
    const res = computeVenue(
      {
        slots: [
          {
            slot_type: "reception",
            guests_adults: 100,
            guests_children: 20,
          },
        ],
      },
      DEFAULT_CONFIG,
    );
    expect(res).not.toBeNull();
    expect(res!.guests).toBe(120);
    expect(res!.recommendedSqm).toBe(216); // 120 × 1.8
    expect(res!.minSqm).toBe(180); // 120 × 1.5
    expect(res!.maxSqm).toBe(240); // 120 × 2.0
    expect(res!.roundTables).toBe(12); // ceil(120 / 10)
  });

  it("alege petrecerea cu cei mai mulți invitați dacă sunt mai multe", () => {
    const res = computeVenue(
      {
        slots: [
          { slot_type: "reception", guests_adults: 50 },
          { slot_type: "reception", guests_adults: 150 },
        ],
      },
      DEFAULT_CONFIG,
    );
    expect(res!.guests).toBe(150);
  });

  it("returnează null fără slot de petrecere", () => {
    expect(
      computeVenue(
        { slots: [{ slot_type: "civil_ceremony", guests_adults: 30 }] },
        DEFAULT_CONFIG,
      ),
    ).toBeNull();
  });
});

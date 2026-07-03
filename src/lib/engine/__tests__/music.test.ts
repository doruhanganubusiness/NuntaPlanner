import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../config";
import { computeMusic } from "../music";
import type { WeddingInput } from "../types";

const reception = (guests: number): WeddingInput["slots"] => [
  { slot_type: "reception", guests_adults: guests },
];

describe("computeMusic — recomandare pe mărime (5.5)", () => {
  it("până în 100 invitați → DJ", () => {
    expect(computeMusic({ slots: reception(80) }, DEFAULT_CONFIG)!.recommendation).toBe("dj");
    expect(computeMusic({ slots: reception(100) }, DEFAULT_CONFIG)!.recommendation).toBe("dj");
  });

  it("101–300 invitați → Formație", () => {
    expect(computeMusic({ slots: reception(101) }, DEFAULT_CONFIG)!.recommendation).toBe("band");
    expect(computeMusic({ slots: reception(250) }, DEFAULT_CONFIG)!.recommendation).toBe("band");
  });

  it("peste 300 invitați → Formație + DJ", () => {
    expect(computeMusic({ slots: reception(350) }, DEFAULT_CONFIG)!.recommendation).toBe("band_and_dj");
  });

  it("nu mai depinde de buget (150 invitați, buget mic) → tot Formație", () => {
    const res = computeMusic(
      { total_budget: 10000, slots: reception(150) },
      DEFAULT_CONFIG,
    );
    expect(res!.recommendation).toBe("band");
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

describe("computeMusic — override manual", () => {
  it("alegerea mirilor suprascrie recomandarea", () => {
    const res = computeMusic(
      { slots: reception(150), music_choice: "dj" },
      DEFAULT_CONFIG,
    );
    expect(res!.recommendation).toBe("band");
    expect(res!.selected).toBe("dj");
    expect(res!.overridden).toBe(true);
  });

  it("dacă alegerea coincide cu recomandarea, nu e considerat override", () => {
    const res = computeMusic(
      { slots: reception(150), music_choice: "band" },
      DEFAULT_CONFIG,
    );
    expect(res!.selected).toBe("band");
    expect(res!.overridden).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { computeBudget } from "../budget";
import { DEFAULT_CONFIG } from "../config";
import type {
  BudgetCategoryKey,
  MusicResult,
  WeddingInput,
} from "../types";

const djMusic = { recommendation: "dj" } as MusicResult;
const bandMusic = { recommendation: "band_and_dj" } as MusicResult;

const pctOf = (
  res: ReturnType<typeof computeBudget>,
  key: BudgetCategoryKey,
) => res.allocations.find((a) => a.key === key)?.pct ?? 0;

const sumPct = (res: ReturnType<typeof computeBudget>) =>
  res.allocations.reduce((s, a) => s + a.pct, 0);

describe("computeBudget — procente (5.6)", () => {
  it("mod cost, profil DJ: locație > 51%, ținute ≥ 8%, muzică ~6%", () => {
    const res = computeBudget(
      { total_budget: 100000, drink_mode: "cost" },
      DEFAULT_CONFIG,
      djMusic,
    );
    expect(sumPct(res)).toBeCloseTo(1, 3);
    expect(pctOf(res, "venue_catering")).toBeGreaterThan(0.51);
    expect(pctOf(res, "attire")).toBeGreaterThanOrEqual(0.08);
    expect(pctOf(res, "music")).toBeCloseTo(0.06, 3);
    const venue = res.allocations.find((a) => a.key === "venue_catering");
    expect(venue!.amountRON).toBe(52000);
  });

  it("profil formație: muzica > 10%, locația rămâne > 51%", () => {
    const res = computeBudget(
      { total_budget: 100000, drink_mode: "cost" },
      DEFAULT_CONFIG,
      bandMusic,
    );
    expect(pctOf(res, "music")).toBeGreaterThan(0.1);
    expect(pctOf(res, "venue_catering")).toBeGreaterThan(0.51);
    expect(sumPct(res)).toBeCloseTo(1, 3);
  });

  it("mod quantities: exclude băutura și renormalizează la 1", () => {
    const res = computeBudget(
      { total_budget: 100000, drink_mode: "quantities" },
      DEFAULT_CONFIG,
      djMusic,
    );
    expect(res.allocations.some((a) => a.key === "drinks")).toBe(false);
    expect(sumPct(res)).toBeCloseTo(1, 3);
    expect(pctOf(res, "venue_catering")).toBeGreaterThan(0.51);
  });

  it("prioritizarea crește ponderea favorizată, păstrând suma 1", () => {
    const priorities: BudgetCategoryKey[] = [
      "photo_video",
      "music",
      "decor_flowers",
      "attire",
      "venue_catering",
      "invitations_favors_cake",
      "misc",
    ];
    const withPrio = computeBudget(
      { total_budget: 100000, drink_mode: "quantities", budget_priorities: priorities },
      DEFAULT_CONFIG,
      djMusic,
    );
    const withoutPrio = computeBudget(
      { total_budget: 100000, drink_mode: "quantities" },
      DEFAULT_CONFIG,
      djMusic,
    );
    expect(pctOf(withPrio, "photo_video")).toBeGreaterThan(
      pctOf(withoutPrio, "photo_video"),
    );
    expect(sumPct(withPrio)).toBeCloseTo(1, 3);
  });
});

describe("computeBudget — buget recomandat", () => {
  const withReception: WeddingInput = {
    drink_mode: "quantities",
    slots: [
      { slot_type: "reception", guests_adults: 90, guests_children: 10 },
    ],
  };

  it("recomandă un total pe baza invitaților când mirii nu au buget", () => {
    const res = computeBudget(withReception, DEFAULT_CONFIG, djMusic);
    // 100 invitați × 300 / 0.52 = 57692 → rotunjit sus la 58000
    expect(res.recommendedTotalRON).toBe(58000);
    expect(res.usingRecommended).toBe(true);
    expect(res.effectiveTotalRON).toBe(58000);
    expect(res.totalBudgetRON).toBeNull();
    // alocările au sume chiar și fără buget introdus
    expect(
      res.allocations.every((a) => a.amountRON !== null),
    ).toBe(true);
  });

  it("bugetul introdus de miri are prioritate față de cel recomandat", () => {
    const res = computeBudget(
      { ...withReception, total_budget: 120000 },
      DEFAULT_CONFIG,
      djMusic,
    );
    expect(res.usingRecommended).toBe(false);
    expect(res.effectiveTotalRON).toBe(120000);
    expect(res.recommendedTotalRON).toBe(58000);
  });

  it("fără petrecere nu recomandă buget", () => {
    const res = computeBudget(
      { slots: [{ slot_type: "civil_ceremony", guests_adults: 30 }] },
      DEFAULT_CONFIG,
      djMusic,
    );
    expect(res.recommendedTotalRON).toBeNull();
  });
});

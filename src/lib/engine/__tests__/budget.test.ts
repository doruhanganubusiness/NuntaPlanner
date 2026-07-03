import { describe, expect, it } from "vitest";
import { computeBudget } from "../budget";
import { DEFAULT_CONFIG } from "../config";
import type { BudgetCategoryKey, WeddingInput } from "../types";

const pctOf = (
  res: ReturnType<typeof computeBudget>,
  key: BudgetCategoryKey,
) => res.allocations.find((a) => a.key === key)?.pct ?? 0;

const sumPct = (res: ReturnType<typeof computeBudget>) =>
  res.allocations.reduce((s, a) => s + a.pct, 0);

describe("computeBudget (5.6)", () => {
  it("mod cost: include băutura, procentele însumează 1", () => {
    const res = computeBudget(
      { total_budget: 100000, drink_mode: "cost" },
      DEFAULT_CONFIG,
    );
    expect(res.allocations.some((a) => a.key === "drinks")).toBe(true);
    expect(sumPct(res)).toBeCloseTo(1, 3);
    // fără priorități, procentele = implicitele
    expect(pctOf(res, "venue_catering")).toBeCloseTo(0.48, 4);
    const venue = res.allocations.find((a) => a.key === "venue_catering");
    expect(venue!.amountRON).toBe(48000);
  });

  it("mod quantities: exclude băutura și renormalizează la 1", () => {
    const res = computeBudget(
      { total_budget: 100000, drink_mode: "quantities" },
      DEFAULT_CONFIG,
    );
    expect(res.allocations.some((a) => a.key === "drinks")).toBe(false);
    expect(sumPct(res)).toBeCloseTo(1, 3);
    // 0.48 / 0.94 ≈ 0.5106
    expect(pctOf(res, "venue_catering")).toBeCloseTo(0.5106, 3);
  });

  it("fără buget total: procente da, sume null", () => {
    const res = computeBudget({ drink_mode: "cost" }, DEFAULT_CONFIG);
    expect(res.totalBudgetRON).toBeNull();
    expect(res.allocations.every((a) => a.amountRON === null)).toBe(true);
    expect(sumPct(res)).toBeCloseTo(1, 3);
  });

  it("prioritizarea crește ponderea categoriei favorizate, păstrând suma 1", () => {
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
    );
    const withoutPrio = computeBudget(
      { total_budget: 100000, drink_mode: "quantities" },
      DEFAULT_CONFIG,
    );
    // photo_video e prima prioritate → pondere mai mare decât implicit
    expect(pctOf(withPrio, "photo_video")).toBeGreaterThan(
      pctOf(withoutPrio, "photo_video"),
    );
    // ultima prioritate → pondere mai mică
    expect(pctOf(withPrio, "misc")).toBeLessThan(pctOf(withoutPrio, "misc"));
    expect(sumPct(withPrio)).toBeCloseTo(1, 3);
  });
});

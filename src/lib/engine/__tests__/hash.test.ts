import { describe, expect, it } from "vitest";
import { stableHash } from "../hash";

describe("stableHash", () => {
  it("e stabil pentru aceeași valoare", () => {
    expect(stableHash({ a: 1, b: 2 })).toBe(stableHash({ a: 1, b: 2 }));
  });

  it("ignoră ordinea cheilor", () => {
    expect(stableHash({ a: 1, b: 2 })).toBe(stableHash({ b: 2, a: 1 }));
  });

  it("diferă când valorile diferă", () => {
    expect(stableHash({ a: 1 })).not.toBe(stableHash({ a: 2 }));
  });

  it("distinge tipurile (array vs obiect)", () => {
    expect(stableHash([1, 2])).not.toBe(stableHash({ 0: 1, 1: 2 }));
  });
});

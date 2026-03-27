import { describe, it, expect } from "vitest";
import { BEACHES } from "@/data/beaches";
import { ISLAND_NAMES, type Island } from "@/types";

describe("BEACHES data", () => {
  it("has at least 20 beaches", () => {
    expect(BEACHES.length).toBeGreaterThanOrEqual(20);
  });

  it("every beach has a unique id", () => {
    const ids = BEACHES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every beach has valid coordinates in the Caribbean", () => {
    for (const beach of BEACHES) {
      // Caribbean roughly: 14-19°N, 59-64°W
      expect(beach.lat).toBeGreaterThan(13);
      expect(beach.lat).toBeLessThan(20);
      expect(beach.lng).toBeGreaterThan(-65);
      expect(beach.lng).toBeLessThan(-59);
    }
  });

  it("every beach has a valid island", () => {
    const validIslands = Object.keys(ISLAND_NAMES) as Island[];
    for (const beach of BEACHES) {
      expect(validIslands).toContain(beach.island);
    }
  });

  it("every beach starts with alert level 'none'", () => {
    for (const beach of BEACHES) {
      expect(beach.alertLevel).toBe("none");
    }
  });

  it("has beaches from at least 3 different islands", () => {
    const islands = new Set(BEACHES.map((b) => b.island));
    expect(islands.size).toBeGreaterThanOrEqual(3);
  });

  it("every beach has a non-empty name", () => {
    for (const beach of BEACHES) {
      expect(beach.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("has beaches from Martinique", () => {
    const mtq = BEACHES.filter((b) => b.island === "martinique");
    expect(mtq.length).toBeGreaterThan(0);
  });

  it("has beaches from Guadeloupe", () => {
    const gwp = BEACHES.filter((b) => b.island === "guadeloupe");
    expect(gwp.length).toBeGreaterThan(0);
  });
});

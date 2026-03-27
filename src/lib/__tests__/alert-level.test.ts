import { describe, it, expect } from "vitest";
import {
  computeAlertLevel,
  isHealthRisk,
  alertSeverity,
} from "@/lib/alert-level";
import type { SargassumReport, AlertLevel } from "@/types";

function makeReport(
  alertLevel: AlertLevel,
  hoursAgo: number = 0,
  beachId: string = "test-beach"
): SargassumReport {
  const now = new Date();
  const createdAt = new Date(
    now.getTime() - hoursAgo * 60 * 60 * 1000
  ).toISOString();
  return {
    id: `report-${Math.random()}`,
    beachId,
    alertLevel,
    createdAt,
    lat: 14.6,
    lng: -61.0,
  };
}

describe("computeAlertLevel", () => {
  const now = new Date("2026-03-27T12:00:00Z");

  it("returns satellite level when no reports exist", () => {
    expect(computeAlertLevel([], "moderate", now)).toBe("moderate");
  });

  it("returns 'none' when no reports and no satellite data", () => {
    expect(computeAlertLevel([], "none", now)).toBe("none");
  });

  it("blends community reports with satellite data", () => {
    const reports = [makeReport("high", 1)];
    // high=3, satellite none=0 -> 3*0.6 + 0*0.4 = 1.8 -> round to 2 -> moderate
    const result = computeAlertLevel(reports, "none", now);
    expect(result).toBe("moderate");
  });

  it("weights recent reports more than old ones", () => {
    const recentReport = makeReport("critical", 1); // 1 hour ago
    const oldReport = makeReport("none", 24 * 6); // 6 days ago (low weight)

    const result = computeAlertLevel([recentReport, oldReport], "none", now);
    // Recent critical should dominate over old none
    expect(["high", "critical", "moderate"]).toContain(result);
  });

  it("ignores reports older than 7 days", () => {
    const oldReport = makeReport("critical", 24 * 8); // 8 days ago
    const result = computeAlertLevel([oldReport], "none", now);
    expect(result).toBe("none"); // Falls back to satellite
  });

  it("handles multiple reports at different levels", () => {
    const reports = [
      makeReport("high", 2),
      makeReport("moderate", 4),
      makeReport("low", 6),
    ];
    const result = computeAlertLevel(reports, "none", now);
    // Should be somewhere in the moderate range
    expect(["low", "moderate", "high"]).toContain(result);
  });

  it("handles all reports being 'none'", () => {
    const reports = [
      makeReport("none", 1),
      makeReport("none", 2),
      makeReport("none", 3),
    ];
    const result = computeAlertLevel(reports, "none", now);
    expect(result).toBe("none");
  });

  it("satellite data raises alert even with low community reports", () => {
    const reports = [makeReport("low", 1)];
    // low=1, satellite critical=4 -> 1*0.6 + 4*0.4 = 2.2 -> round to 2 -> moderate
    const result = computeAlertLevel(reports, "critical", now);
    expect(result).toBe("moderate");
  });
});

describe("isHealthRisk", () => {
  it("returns true for high and critical", () => {
    expect(isHealthRisk("high")).toBe(true);
    expect(isHealthRisk("critical")).toBe(true);
  });

  it("returns false for none, low, moderate", () => {
    expect(isHealthRisk("none")).toBe(false);
    expect(isHealthRisk("low")).toBe(false);
    expect(isHealthRisk("moderate")).toBe(false);
  });
});

describe("alertSeverity", () => {
  it("returns increasing numbers for increasing severity", () => {
    expect(alertSeverity("none")).toBeLessThan(alertSeverity("low"));
    expect(alertSeverity("low")).toBeLessThan(alertSeverity("moderate"));
    expect(alertSeverity("moderate")).toBeLessThan(alertSeverity("high"));
    expect(alertSeverity("high")).toBeLessThan(alertSeverity("critical"));
  });

  it("returns 0 for none", () => {
    expect(alertSeverity("none")).toBe(0);
  });

  it("returns 4 for critical", () => {
    expect(alertSeverity("critical")).toBe(4);
  });
});

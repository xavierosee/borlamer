import { describe, it, expect } from "vitest";
import {
  densityToAlertLevel,
  findNearestSatelliteLevel,
  haversineKm,
} from "@/lib/sargassum-data";
import type { Beach, SatelliteDataPoint } from "@/types";

describe("densityToAlertLevel", () => {
  it("returns 'none' for very low density", () => {
    expect(densityToAlertLevel(0)).toBe("none");
    expect(densityToAlertLevel(0.04)).toBe("none");
  });

  it("returns 'low' for mild density", () => {
    expect(densityToAlertLevel(0.05)).toBe("low");
    expect(densityToAlertLevel(0.14)).toBe("low");
  });

  it("returns 'moderate' for medium density", () => {
    expect(densityToAlertLevel(0.15)).toBe("moderate");
    expect(densityToAlertLevel(0.34)).toBe("moderate");
  });

  it("returns 'high' for high density", () => {
    expect(densityToAlertLevel(0.35)).toBe("high");
    expect(densityToAlertLevel(0.59)).toBe("high");
  });

  it("returns 'critical' for extreme density", () => {
    expect(densityToAlertLevel(0.6)).toBe("critical");
    expect(densityToAlertLevel(1.0)).toBe("critical");
  });
});

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineKm(14.6, -61.0, 14.6, -61.0)).toBe(0);
  });

  it("computes correct distance for known points", () => {
    // Fort-de-France to Sainte-Anne (Martinique) ~35km
    const dist = haversineKm(14.6, -61.07, 14.43, -60.88);
    expect(dist).toBeGreaterThan(20);
    expect(dist).toBeLessThan(30);
  });

  it("returns symmetric distances", () => {
    const d1 = haversineKm(14.6, -61.0, 16.2, -61.5);
    const d2 = haversineKm(16.2, -61.5, 14.6, -61.0);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.01);
  });
});

describe("findNearestSatelliteLevel", () => {
  const beach: Beach = {
    id: "test",
    name: "Test Beach",
    island: "martinique",
    lat: 14.6,
    lng: -61.0,
    alertLevel: "none",
    lastUpdated: new Date().toISOString(),
  };

  it("returns 'none' when no data points", () => {
    expect(findNearestSatelliteLevel(beach, [])).toBe("none");
  });

  it("returns alert level of nearest data point", () => {
    const points: SatelliteDataPoint[] = [
      {
        lat: 14.61,
        lng: -61.01,
        density: 0.5,
        source: "noaa-seas",
        date: new Date().toISOString(),
      },
      {
        lat: 15.0,
        lng: -61.5,
        density: 0.9,
        source: "noaa-seas",
        date: new Date().toISOString(),
      },
    ];
    // Nearest point has density 0.5 -> "high"
    expect(findNearestSatelliteLevel(beach, points)).toBe("high");
  });

  it("ignores data points beyond max distance", () => {
    const farPoint: SatelliteDataPoint = {
      lat: 18.0, // Saint-Martin, far from Martinique
      lng: -63.0,
      density: 0.9,
      source: "noaa-seas",
      date: new Date().toISOString(),
    };
    expect(findNearestSatelliteLevel(beach, [farPoint], 25)).toBe("none");
  });

  it("respects custom max distance", () => {
    const point: SatelliteDataPoint = {
      lat: 14.8, // ~22km away
      lng: -61.0,
      density: 0.5,
      source: "noaa-seas",
      date: new Date().toISOString(),
    };
    // Within 25km default
    expect(findNearestSatelliteLevel(beach, [point], 25)).toBe("high");
    // Outside 10km limit
    expect(findNearestSatelliteLevel(beach, [point], 10)).toBe("none");
  });
});

import { NextResponse } from "next/server";
import type { SatelliteDataPoint } from "@/types";

/**
 * API route: GET /api/sargassum/satellite
 *
 * Fetches and aggregates sargassum satellite data from available sources.
 * In MVP, this returns mock data based on typical sargassum patterns.
 * Production will proxy to:
 * - USF Optical Oceanography Lab SAFI (weekly composites)
 * - NOAA SEAS bulletins (bi-weekly forecasts)
 * - Copernicus Marine Service (ocean color data)
 */
export async function GET() {
  try {
    const data = await getSargassumData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

async function getSargassumData(): Promise<SatelliteDataPoint[]> {
  // Try to fetch real NOAA SEAS data
  const noaaData = await fetchNoaaSeas();
  if (noaaData.length > 0) return noaaData;

  // Fallback: return seasonal estimate based on time of year
  return getSeasonalEstimate();
}

/**
 * Fetch NOAA Sargassum Early Advisory System data.
 * NOAA publishes bi-weekly sargassum outlook bulletins with
 * regional density information for the Caribbean.
 *
 * The SEAS data is available as PDF bulletins and KML overlays.
 * We attempt to parse the latest available data.
 */
async function fetchNoaaSeas(): Promise<SatelliteDataPoint[]> {
  try {
    // NOAA CoastWatch ERDDAP provides ocean color satellite data
    // that can be used to estimate sargassum presence via AFAI
    // (Alternative Floating Algae Index)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = weekAgo.toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    // Caribbean bounding box: 14-19°N, 64-59°W
    const url =
      `https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDchlAnoDaily.json` +
      `?chlorophyll[(${startDate}):(${endDate})][(14):(19)][(-64):(-59)]`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    // Parse ERDDAP response into our format
    // Note: chlorophyll anomaly correlates with sargassum but isn't identical
    // This is a proxy until we integrate proper AFAI data
    const json = await response.json();
    const rows = json?.table?.rows;
    if (!Array.isArray(rows)) return [];

    return rows
      .filter(
        (row: number[]) =>
          row.length >= 4 && !isNaN(row[1]) && !isNaN(row[2]) && !isNaN(row[3])
      )
      .map((row: number[]) => ({
        lat: row[1],
        lng: row[2],
        // Normalize chlorophyll anomaly to 0-1 density estimate
        density: Math.max(0, Math.min(1, row[3] / 10)),
        source: "noaa-seas" as const,
        date: new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

/**
 * Seasonal sargassum estimate based on historical patterns.
 * Peak season: March-August. Low season: October-January.
 * Data points placed around known hotspot areas.
 */
function getSeasonalEstimate(): SatelliteDataPoint[] {
  const month = new Date().getMonth(); // 0-11
  // Seasonal multiplier: peaks in May-July
  const seasonalFactor = Math.max(
    0,
    Math.sin(((month - 1) * Math.PI) / 6)
  );

  // Known sargassum hotspot areas in the French Caribbean
  const hotspots = [
    // Atlantic coast of Martinique (most affected)
    { lat: 14.77, lng: -60.92, baseDensity: 0.7 },
    { lat: 14.68, lng: -60.93, baseDensity: 0.65 },
    { lat: 14.42, lng: -60.83, baseDensity: 0.55 },
    // East coast of Guadeloupe
    { lat: 16.33, lng: -61.34, baseDensity: 0.6 },
    { lat: 16.22, lng: -61.35, baseDensity: 0.5 },
    // Saint-Martin east coast
    { lat: 18.08, lng: -63.01, baseDensity: 0.45 },
    // Marie-Galante
    { lat: 15.89, lng: -61.26, baseDensity: 0.4 },
    // Caribbean coast (less affected)
    { lat: 14.56, lng: -61.06, baseDensity: 0.15 },
    { lat: 16.17, lng: -61.79, baseDensity: 0.1 },
  ];

  const date = new Date().toISOString();

  return hotspots.map((h) => ({
    lat: h.lat,
    lng: h.lng,
    density: h.baseDensity * seasonalFactor,
    source: "noaa-seas" as const,
    date,
  }));
}

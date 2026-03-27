import type { AlertLevel, Beach, SatelliteDataPoint } from "@/types";

/**
 * Fetch the latest sargassum outlook from the USF Optical Oceanography Lab
 * SAFI (Sargassum Abundance Floating Index) dataset.
 *
 * The USF publishes weekly GeoTIFF images and summary data.
 * We use their public summary endpoint to get density values
 * for the Caribbean region.
 *
 * Fallback: if the API is unreachable, returns empty array (offline-first).
 */
export async function fetchSatelliteData(): Promise<SatelliteDataPoint[]> {
  // USF SAFI data is published as monthly composites
  // We parse the latest available Caribbean sub-region data
  try {
    const response = await fetch("/api/sargassum/satellite", {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    // Offline or API unavailable — return empty, use cached data
    return [];
  }
}

/**
 * Convert satellite density (0-1) to an alert level.
 * Thresholds based on USF/NOAA categorization.
 */
export function densityToAlertLevel(density: number): AlertLevel {
  if (density < 0.05) return "none";
  if (density < 0.15) return "low";
  if (density < 0.35) return "moderate";
  if (density < 0.6) return "high";
  return "critical";
}

/**
 * Find the closest satellite data point to a beach location.
 * Returns the alert level for the nearest observation within 25km.
 */
export function findNearestSatelliteLevel(
  beach: Beach,
  dataPoints: SatelliteDataPoint[],
  maxDistanceKm: number = 25
): AlertLevel {
  let nearestDist = Infinity;
  let nearestDensity = 0;

  for (const point of dataPoints) {
    const dist = haversineKm(beach.lat, beach.lng, point.lat, point.lng);
    if (dist < nearestDist && dist <= maxDistanceKm) {
      nearestDist = dist;
      nearestDensity = point.density;
    }
  }

  if (nearestDist === Infinity) return "none";
  return densityToAlertLevel(nearestDensity);
}

/**
 * Haversine distance in km between two lat/lng points.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

import type { AlertLevel, SargassumReport } from "@/types";

/**
 * Compute an aggregate alert level from a set of community reports.
 * Uses a weighted average: more recent reports count more.
 * Falls back to satellite data level if no community reports exist.
 */
export function computeAlertLevel(
  reports: SargassumReport[],
  satelliteLevel: AlertLevel = "none",
  now: Date = new Date()
): AlertLevel {
  if (reports.length === 0) return satelliteLevel;

  const LEVEL_SCORES: Record<AlertLevel, number> = {
    none: 0,
    low: 1,
    moderate: 2,
    high: 3,
    critical: 4,
  };

  const SCORE_TO_LEVEL: AlertLevel[] = [
    "none",
    "low",
    "moderate",
    "high",
    "critical",
  ];

  // Weight reports by recency — last 24h = full weight, decays over 7 days
  const DECAY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const nowMs = now.getTime();

  let weightedSum = 0;
  let totalWeight = 0;

  for (const report of reports) {
    const ageMs = nowMs - new Date(report.createdAt).getTime();
    if (ageMs > DECAY_MS) continue; // Ignore reports older than 7 days

    const weight = Math.max(0, 1 - ageMs / DECAY_MS);
    weightedSum += LEVEL_SCORES[report.alertLevel] * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return satelliteLevel;

  const avgScore = weightedSum / totalWeight;

  // Blend with satellite data (60% community, 40% satellite)
  const satelliteScore = LEVEL_SCORES[satelliteLevel];
  const blendedScore = avgScore * 0.6 + satelliteScore * 0.4;

  const roundedIndex = Math.min(
    Math.round(blendedScore),
    SCORE_TO_LEVEL.length - 1
  );
  return SCORE_TO_LEVEL[roundedIndex];
}

/**
 * Determine if an alert level represents a health risk (H₂S gas).
 */
export function isHealthRisk(level: AlertLevel): boolean {
  return level === "high" || level === "critical";
}

/**
 * Get a severity number for sorting (higher = worse).
 */
export function alertSeverity(level: AlertLevel): number {
  const scores: Record<AlertLevel, number> = {
    none: 0,
    low: 1,
    moderate: 2,
    high: 3,
    critical: 4,
  };
  return scores[level];
}

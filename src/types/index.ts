/** Alert level for sargassum presence at a beach */
export type AlertLevel = "none" | "low" | "moderate" | "high" | "critical";

/** A beach or coastal location in the French Caribbean */
export interface Beach {
  id: string;
  name: string;
  island: Island;
  lat: number;
  lng: number;
  /** Current sargassum alert level */
  alertLevel: AlertLevel;
  /** When the alert level was last updated */
  lastUpdated: string; // ISO 8601
}

/** Supported islands */
export type Island =
  | "martinique"
  | "guadeloupe"
  | "saint-martin"
  | "saint-barthelemy"
  | "la-desirade"
  | "marie-galante"
  | "les-saintes";

/** A community-submitted sargassum report */
export interface SargassumReport {
  id: string;
  beachId: string;
  /** Reporter-assessed level */
  alertLevel: AlertLevel;
  /** Optional photo URL (local blob or remote) */
  photoUrl?: string;
  /** Free-text description */
  description?: string;
  /** When the report was created */
  createdAt: string; // ISO 8601
  /** Coordinates where the report was pinned */
  lat: number;
  lng: number;
}

/** Satellite data point from NOAA/USF */
export interface SatelliteDataPoint {
  lat: number;
  lng: number;
  /** Sargassum density 0-1 */
  density: number;
  /** Source dataset identifier */
  source: "noaa-seas" | "usf-safi" | "copernicus";
  /** Observation date */
  date: string; // ISO 8601
}

/** Display metadata for alert levels */
export const ALERT_LEVEL_CONFIG: Record<
  AlertLevel,
  { label: string; color: string; emoji: string; description: string }
> = {
  none: {
    label: "Aucun",
    color: "#16a34a",
    emoji: "🟢",
    description: "Pas de sargasses observées",
  },
  low: {
    label: "Faible",
    color: "#84cc16",
    emoji: "🟡",
    description: "Quelques échouages limités",
  },
  moderate: {
    label: "Modéré",
    color: "#f59e0b",
    emoji: "🟠",
    description: "Échouages modérés, odeur possible",
  },
  high: {
    label: "Élevé",
    color: "#ef4444",
    emoji: "🔴",
    description: "Échouages importants, H₂S possible",
  },
  critical: {
    label: "Critique",
    color: "#7c2d12",
    emoji: "⚫",
    description: "Échouages massifs, risque sanitaire",
  },
};

/** Island display names */
export const ISLAND_NAMES: Record<Island, string> = {
  martinique: "Martinique",
  guadeloupe: "Guadeloupe",
  "saint-martin": "Saint-Martin",
  "saint-barthelemy": "Saint-Barthélemy",
  "la-desirade": "La Désirade",
  "marie-galante": "Marie-Galante",
  "les-saintes": "Les Saintes",
};

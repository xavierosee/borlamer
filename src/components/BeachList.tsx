"use client";

import type { Beach, Island } from "@/types";
import { ISLAND_NAMES } from "@/types";
import { AlertBadge } from "./AlertBadge";
import { alertSeverity, isHealthRisk } from "@/lib/alert-level";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface BeachListProps {
  beaches: Beach[];
  selectedIsland: Island | "all";
  onSelectBeach: (beach: Beach) => void;
  onSelectIsland: (island: Island | "all") => void;
}

export function BeachList({
  beaches,
  selectedIsland,
  onSelectBeach,
  onSelectIsland,
}: BeachListProps) {
  const filtered =
    selectedIsland === "all"
      ? beaches
      : beaches.filter((b) => b.island === selectedIsland);

  // Sort by severity (worst first), then alphabetically
  const sorted = [...filtered].sort((a, b) => {
    const severityDiff = alertSeverity(b.alertLevel) - alertSeverity(a.alertLevel);
    if (severityDiff !== 0) return severityDiff;
    return a.name.localeCompare(b.name, "fr");
  });

  const islands = Object.entries(ISLAND_NAMES) as [Island, string][];

  return (
    <div className="flex flex-col gap-3">
      {/* Island filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectIsland("all")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            selectedIsland === "all"
              ? "bg-cyan-600 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          Toutes
        </button>
        {islands.map(([key, name]) => (
          <button
            key={key}
            onClick={() => onSelectIsland(key)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedIsland === key
                ? "bg-cyan-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Beach cards */}
      <div className="flex flex-col gap-2">
        {sorted.map((beach) => (
          <button
            key={beach.id}
            onClick={() => onSelectBeach(beach)}
            className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:shadow-md ${
              isHealthRisk(beach.alertLevel)
                ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
                : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{beach.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ISLAND_NAMES[beach.island]} · Mis à jour{" "}
                {formatDistanceToNow(new Date(beach.lastUpdated), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            </div>
            <AlertBadge level={beach.alertLevel} size="sm" />
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="py-8 text-center text-slate-500">
          Aucune plage trouvée pour cette île.
        </p>
      )}
    </div>
  );
}

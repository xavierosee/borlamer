"use client";

import { useCallback, useEffect, useState } from "react";
import type { Beach, Island, SargassumReport } from "@/types";
import { BEACHES } from "@/data/beaches";
import { MapView } from "@/components/MapView";
import { BeachList } from "@/components/BeachList";
import { ReportForm } from "@/components/ReportForm";
import { AlertBadge } from "@/components/AlertBadge";
import { isHealthRisk } from "@/lib/alert-level";
import { computeAlertLevel } from "@/lib/alert-level";
import { ALERT_LEVEL_CONFIG, ISLAND_NAMES } from "@/types";
import { fetchSatelliteData, findNearestSatelliteLevel } from "@/lib/sargassum-data";

type View = "map" | "list";

export default function HomePage() {
  const [beaches, setBeaches] = useState<Beach[]>(BEACHES);
  const [reports, setReports] = useState<SargassumReport[]>([]);
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<Island | "all">("all");
  const [view, setView] = useState<View>("map");
  const [showReportForm, setShowReportForm] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Detect online/offline
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load satellite data and update beach alert levels
  useEffect(() => {
    async function loadData() {
      try {
        const satelliteData = await fetchSatelliteData();
        if (satelliteData.length > 0) {
          setBeaches((prev) =>
            prev.map((beach) => {
              const satLevel = findNearestSatelliteLevel(beach, satelliteData);
              const beachReports = reports.filter(
                (r) => r.beachId === beach.id
              );
              const level = computeAlertLevel(beachReports, satLevel);
              return {
                ...beach,
                alertLevel: level,
                lastUpdated: new Date().toISOString(),
              };
            })
          );
          setLastSync(new Date().toISOString());
        }
      } catch {
        // Offline — use cached data
      }
    }
    loadData();
    // Refresh every 30 minutes
    const interval = setInterval(loadData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [reports]);

  // Load reports from IndexedDB on mount
  useEffect(() => {
    async function loadOfflineData() {
      try {
        const { getAllReports, getAllBeaches } = await import(
          "@/lib/offline-store"
        );
        const [savedReports, savedBeaches] = await Promise.all([
          getAllReports(),
          getAllBeaches(),
        ]);
        if (savedReports.length > 0) setReports(savedReports);
        if (savedBeaches.length > 0) setBeaches(savedBeaches);
      } catch {
        // IndexedDB not available — use defaults
      }
    }
    loadOfflineData();
  }, []);

  // Save to IndexedDB when data changes
  useEffect(() => {
    async function persist() {
      try {
        const { saveBeaches } = await import("@/lib/offline-store");
        await saveBeaches(beaches);
      } catch {
        // Silent fail on save
      }
    }
    persist();
  }, [beaches]);

  const handleSubmitReport = useCallback(
    async (report: SargassumReport) => {
      setReports((prev) => [...prev, report]);
      setShowReportForm(false);

      // Persist to IndexedDB
      try {
        const { saveReport } = await import("@/lib/offline-store");
        await saveReport(report);
      } catch {
        // Will sync later
      }

      // Update the beach's alert level
      setBeaches((prev) =>
        prev.map((beach) => {
          if (beach.id !== report.beachId) return beach;
          const beachReports = [...reports, report].filter(
            (r) => r.beachId === beach.id
          );
          return {
            ...beach,
            alertLevel: computeAlertLevel(beachReports, beach.alertLevel),
            lastUpdated: new Date().toISOString(),
          };
        })
      );
    },
    [reports]
  );

  const handleSelectBeach = useCallback((beach: Beach) => {
    setSelectedBeach(beach);
    setShowReportForm(false);
  }, []);

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
            🌊 Borlamer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suivi des sargasses — Antilles françaises
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Hors ligne
            </span>
          )}
          {lastSync && (
            <span className="text-xs text-slate-400">
              Sync:{" "}
              {new Date(lastSync).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </header>

      {/* View toggle */}
      <div className="flex border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <button
          onClick={() => setView("map")}
          className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
            view === "map"
              ? "border-b-2 border-cyan-600 text-cyan-700 dark:text-cyan-400"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Carte
        </button>
        <button
          onClick={() => setView("list")}
          className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
            view === "list"
              ? "border-b-2 border-cyan-600 text-cyan-700 dark:text-cyan-400"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Liste
        </button>
      </div>

      {/* Main content */}
      <main className="relative flex-1 overflow-hidden">
        {view === "map" ? (
          <MapView
            beaches={beaches}
            selectedBeach={selectedBeach}
            onSelectBeach={handleSelectBeach}
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <BeachList
              beaches={beaches}
              selectedIsland={selectedIsland}
              onSelectBeach={handleSelectBeach}
              onSelectIsland={setSelectedIsland}
            />
          </div>
        )}

        {/* Beach detail panel */}
        {selectedBeach && !showReportForm && (
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-slate-300" />
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{selectedBeach.name}</h2>
                <p className="text-sm text-slate-500">
                  {ISLAND_NAMES[selectedBeach.island]}
                </p>
              </div>
              <AlertBadge level={selectedBeach.alertLevel} />
            </div>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {ALERT_LEVEL_CONFIG[selectedBeach.alertLevel].description}
            </p>

            {isHealthRisk(selectedBeach.alertLevel) && (
              <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                <strong>Attention :</strong> Risque de dégagement de H₂S (hydrogène sulfuré).
                Évitez de rester longtemps à proximité des sargasses en décomposition.
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowReportForm(true)}
                className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
              >
                Signaler l&apos;état
              </button>
              <button
                onClick={() => setSelectedBeach(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Report form panel */}
        {selectedBeach && showReportForm && (
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-slate-300" />
            <ReportForm
              beach={selectedBeach}
              onSubmit={handleSubmitReport}
              onCancel={() => setShowReportForm(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

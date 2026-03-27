import { openDB, type IDBPDatabase } from "idb";
import type { Beach, SargassumReport } from "@/types";

const DB_NAME = "borlamer";
const DB_VERSION = 1;

export interface BorlamerDB {
  beaches: {
    key: string;
    value: Beach;
    indexes: { "by-island": string };
  };
  reports: {
    key: string;
    value: SargassumReport;
    indexes: { "by-beach": string; "by-date": string };
  };
  meta: {
    key: string;
    value: { key: string; value: string };
  };
}

let dbPromise: Promise<IDBPDatabase<BorlamerDB>> | null = null;

function getDB(): Promise<IDBPDatabase<BorlamerDB>> {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (!dbPromise) {
    dbPromise = openDB<BorlamerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Beaches store
        const beachStore = db.createObjectStore("beaches", { keyPath: "id" });
        beachStore.createIndex("by-island", "island");

        // Reports store
        const reportStore = db.createObjectStore("reports", { keyPath: "id" });
        reportStore.createIndex("by-beach", "beachId");
        reportStore.createIndex("by-date", "createdAt");

        // Metadata store (last sync time, etc.)
        db.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

// === Beach operations ===

export async function getAllBeaches(): Promise<Beach[]> {
  const db = await getDB();
  return db.getAll("beaches");
}

export async function getBeachesByIsland(island: string): Promise<Beach[]> {
  const db = await getDB();
  return db.getAllFromIndex("beaches", "by-island", island);
}

export async function saveBeaches(beaches: Beach[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("beaches", "readwrite");
  await Promise.all([
    ...beaches.map((beach) => tx.store.put(beach)),
    tx.done,
  ]);
}

// === Report operations ===

export async function getReportsForBeach(
  beachId: string
): Promise<SargassumReport[]> {
  const db = await getDB();
  return db.getAllFromIndex("reports", "by-beach", beachId);
}

export async function getAllReports(): Promise<SargassumReport[]> {
  const db = await getDB();
  return db.getAll("reports");
}

export async function saveReport(report: SargassumReport): Promise<void> {
  const db = await getDB();
  await db.put("reports", report);
}

// === Meta operations ===

export async function getLastSyncTime(): Promise<string | null> {
  const db = await getDB();
  const record = await db.get("meta", "lastSync");
  return record?.value ?? null;
}

export async function setLastSyncTime(isoDate: string): Promise<void> {
  const db = await getDB();
  await db.put("meta", { key: "lastSync", value: isoDate });
}

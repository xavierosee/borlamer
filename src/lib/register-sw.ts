/**
 * Register the service worker for offline-first PWA support.
 * Call this once from the root layout or page.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("[Borlamer] SW registered:", registration.scope);
    } catch (error) {
      console.warn("[Borlamer] SW registration failed:", error);
    }
  });
}

"use client";

import { useEffect, useRef } from "react";
import type { Beach } from "@/types";
import { ALERT_LEVEL_CONFIG } from "@/types";

interface MapViewProps {
  beaches: Beach[];
  selectedBeach: Beach | null;
  onSelectBeach: (beach: Beach) => void;
}

export function MapView({ beaches, selectedBeach, onSelectBeach }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import of Leaflet (client-side only)
    import("leaflet").then((L) => {
      // Fix default icon paths for webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [15.5, -61.5], // Center on French Caribbean
        zoom: 8,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers for all beaches
      updateMarkers(L, map, beaches, onSelectBeach);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when beaches change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      updateMarkers(L, mapInstanceRef.current!, beaches, onSelectBeach);
    });
  }, [beaches, onSelectBeach]);

  // Pan to selected beach
  useEffect(() => {
    if (!selectedBeach || !mapInstanceRef.current) return;
    mapInstanceRef.current.setView([selectedBeach.lat, selectedBeach.lng], 13, {
      animate: true,
    });
  }, [selectedBeach]);

  function updateMarkers(
    L: typeof import("leaflet"),
    map: L.Map,
    beachList: Beach[],
    onSelect: (b: Beach) => void
  ) {
    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const beach of beachList) {
      const config = ALERT_LEVEL_CONFIG[beach.alertLevel];
      const marker = L.circleMarker([beach.lat, beach.lng], {
        radius: 10,
        fillColor: config.color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center">
            <strong>${beach.name}</strong><br/>
            <span style="color:${config.color}">${config.emoji} ${config.label}</span><br/>
            <small>${config.description}</small>
          </div>`
        )
        .on("click", () => onSelect(beach));

      markersRef.current.push(marker);
    }
  }

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-xl"
      role="application"
      aria-label="Carte des plages"
    />
  );
}

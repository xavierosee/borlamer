'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Beach } from '@/lib/beaches';
import BeachMarker from './BeachMarker';
import { useTranslations } from 'next-intl';

// Fix Leaflet default icon paths in Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const GUADELOUPE_CENTER: [number, number] = [16.25, -61.58];
const DEFAULT_ZOOM = 10;

function LocateButton() {
  const map = useMap();
  const t = useTranslations('map');

  const handleLocate = useCallback(() => {
    map.locate({ setView: true, maxZoom: 13 });
  }, [map]);

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-4 right-4 z-[1000] bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
      aria-label={t('locateMe')}
      title={t('locateMe')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

interface BeachMapProps {
  locale: string;
}

export default function BeachMap({ locale }: BeachMapProps) {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('map');

  useEffect(() => {
    fetch('/api/beaches')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: Beach[]) => {
        setBeaches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load beaches:', err);
        setError(t('error'));
        setLoading(false);
      });
  }, [t]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-white/80">
          <p className="text-gray-500 text-sm">{t('loading')}</p>
        </div>
      )}
      <MapContainer
        center={GUADELOUPE_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {beaches.map((beach) => (
          <BeachMarker key={beach.id} beach={beach} locale={locale} />
        ))}
        <LocateButton />
      </MapContainer>
    </div>
  );
}

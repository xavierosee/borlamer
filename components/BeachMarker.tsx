'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Beach } from '@/lib/beaches';
import StatusBadge from './StatusBadge';
import { useTranslations } from 'next-intl';

const markerColors: Record<string, string> = {
  clean: '#22c55e',
  moderate: '#f97316',
  bad: '#ef4444',
  unknown: '#9ca3af',
};

function createIcon(status: string) {
  const color = markerColors[status] || markerColors.unknown;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="#fff" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface BeachMarkerProps {
  beach: Beach;
  locale: string;
}

export default function BeachMarker({ beach, locale }: BeachMarkerProps) {
  const t = useTranslations();
  const icon = createIcon(beach.current_status);

  const sourceKey = beach.last_report_source || 'none';

  return (
    <Marker position={[beach.lat, beach.lng]} icon={icon}>
      <Popup>
        <div className="min-w-[180px]">
          <h3 className="font-semibold text-sm mb-1">
            {locale === 'fr' && beach.name_fr ? beach.name_fr : beach.name}
          </h3>
          <StatusBadge status={beach.current_status} />
          {beach.last_updated && (
            <p className="text-xs text-gray-500 mt-1">
              {t('beach.lastUpdated')}: {formatDate(beach.last_updated, locale)}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {t(`beach.source.${sourceKey}`)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

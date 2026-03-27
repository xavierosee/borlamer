# Borlamer — Architecture

## What is Borlamer?

Borlamer tracks sargassum (brown algae) invasions on beaches across the French Caribbean: Martinique, Guadeloupe, Saint-Martin, Saint-Barthélemy, Marie-Galante, La Désirade, and Les Saintes.

Sargassum causes health risks (H₂S gas from decomposition), environmental damage, and tourism disruption. Borlamer gives residents and visitors a simple way to check beach conditions before going out.

## Stack Decisions

### PWA over React Native

**Choice:** Next.js PWA (Progressive Web App)
**Why not React Native?**

- One codebase for all platforms (mobile, desktop, any browser)
- No app store gatekeeping or review delays — critical for a small team
- Installable on mobile home screens via PWA manifest
- Service worker enables full offline support
- One-person deployable to any static host or Vercel

**Why not Flutter?** The previous version used Flutter + Mapbox. Flutter requires maintaining platform-specific builds and Mapbox licensing adds cost. PWA with Leaflet/OSM is free and simpler.

### Leaflet + OpenStreetMap over Mapbox

- Free, no API keys or usage limits
- Works offline (map tiles are cached by the service worker)
- Sufficient for beach-level mapping in the Caribbean
- Active open-source ecosystem

### TypeScript Throughout

Every file is TypeScript. Zod is available for runtime validation at API boundaries. The type system catches mismatches between satellite data formats and our internal types.

### Offline-First with IndexedDB

Caribbean internet connectivity is unreliable — especially on beaches, which is exactly where this app is used. Architecture:

1. **IndexedDB** (via `idb` library) stores beaches, reports, and sync metadata locally
2. **Service Worker** caches the app shell, map tiles, and API responses
3. **Network-first for API data** — fetch fresh satellite data when online, fall back to cached
4. **Cache-first for static assets** — instant load even without network
5. Community reports are saved locally immediately, synced to server when online

### Data Sources

Sargassum density data comes from multiple sources, aggregated on the server:

| Source | Type | Frequency | Integration |
|--------|------|-----------|-------------|
| NOAA CoastWatch ERDDAP | Chlorophyll anomaly (AFAI proxy) | Daily | REST API (JSON) |
| USF Optical Oceanography SAFI | Satellite sargassum density | Weekly | GeoTIFF via proxy |
| Community reports | User observations + photos | Real-time | IndexedDB + API |

The satellite API route (`/api/sargassum/satellite`) aggregates these sources. A seasonal fallback model provides baseline estimates when APIs are unreachable.

### Alert Level System

Five levels (none → low → moderate → high → critical) computed by blending:
- **Satellite data** (40% weight) — objective, covers open ocean approach
- **Community reports** (60% weight) — ground truth, recency-weighted over 7 days

Reports older than 7 days decay to zero weight. This ensures the system reflects current conditions, not stale reports.

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (PWA meta, Leaflet CSS)
│   ├── page.tsx            # Main page (map + list views)
│   ├── globals.css         # Tailwind + dark mode + Leaflet overrides
│   └── api/sargassum/      # Server-side data aggregation
│       └── satellite/route.ts
├── components/             # React components
│   ├── MapView.tsx         # Leaflet map with beach markers
│   ├── BeachList.tsx       # Filterable beach list with alert badges
│   ├── AlertBadge.tsx      # Color-coded alert level indicator
│   └── ReportForm.tsx      # Community sargassum report submission
├── lib/                    # Core logic (tested)
│   ├── alert-level.ts      # Alert computation, severity, health risk
│   ├── sargassum-data.ts   # Satellite data fetching + haversine distance
│   ├── offline-store.ts    # IndexedDB operations
│   └── register-sw.ts      # Service worker registration
├── data/                   # Static data
│   └── beaches.ts          # 24 curated beaches across 5 islands
├── types/                  # TypeScript types and constants
│   └── index.ts
└── test/
    └── setup.ts            # Vitest + Testing Library setup
public/
├── manifest.json           # PWA manifest
└── sw.js                   # Service worker (offline caching)
```

## Testing Strategy

- **Vitest** for unit tests (fast, Vite-compatible)
- **34 tests** covering:
  - Alert level computation (blending, decay, edge cases)
  - Satellite data conversion (density → alert level)
  - Haversine distance calculation
  - Beach data integrity (coordinates, uniqueness, island coverage)
- Core logic in `src/lib/` has full test coverage
- Components tested via integration when needed

## Deployment

Single-command deploy:
```bash
npm run build    # Produces standalone Next.js output
```

Deployable to Vercel (zero-config), Docker, or any Node.js host. The `output: "standalone"` config in `next.config.ts` creates a self-contained build.

## Future Work

- **Real NOAA SEAS integration**: Parse bi-weekly SEAS bulletin PDFs for Caribbean-specific forecasts
- **USF SAFI GeoTIFF proxy**: Download and sample weekly satellite composites
- **Photo storage**: Object storage (R2/S3) for community report photos
- **Push notifications**: Alert subscribers when their saved beaches reach high/critical
- **Capacitor wrapper**: Native camera access, push notifications on iOS/Android
- **Multi-language**: English + Créole in addition to French

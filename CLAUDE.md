# Borlamer

Sargassum beach condition tracker for Guadeloupe, French Caribbean.

## Architecture

- **Framework:** Next.js 14 App Router with TypeScript (strict mode)
- **Map:** Leaflet + React-Leaflet + OpenStreetMap tiles (NOT Mapbox)
- **Database:** Supabase (Postgres with RLS)
- **Hosting:** Vercel
- **i18n:** next-intl — French (default) + English, locale prefix "as-needed"
- **Styling:** Tailwind CSS, mobile-first
- **PWA:** next-pwa with manifest.json, service worker, installable

## Key decisions

- **No user auth.** Partners get a shared token URL (e.g. `/fr/report/abc123`). No OAuth, no login for MVP.
- **Satellite fallback.** Weekly Vercel cron (`/api/cron/satellite`) will scrape sargassummonitoring.com. Placeholder for now.
- **No crowdsourcing.** Only partner reports and satellite data for MVP.
- **Leaflet SSR.** BeachMap is loaded via `dynamic()` with `ssr: false` to avoid window/document errors.

## Project structure

```
app/[locale]/page.tsx        — Tourist map (full-screen Leaflet)
app/[locale]/report/[token]/ — Partner reporting form
app/api/beaches/             — GET all beaches
app/api/report/              — POST condition report
app/api/cron/satellite/      — Vercel cron endpoint
components/                  — BeachMap, BeachMarker, StatusBadge
lib/                         — Supabase client, beaches, reports helpers
messages/                    — fr.json, en.json
supabase/migrations/         — SQL schema
supabase/seed.sql            — 20 real Guadeloupe beaches
```

## Run locally

```bash
cp .env.example .env.local
# Fill in Supabase credentials
npm install
npm run dev
```

## Commands

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint

## Status colors

- 🟢 clean — green marker
- 🟠 moderate — orange marker
- 🔴 bad — red marker
- ⚪ unknown — grey marker

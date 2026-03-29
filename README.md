# Borlamer

Sargassum (algae) beach condition tracker for Guadeloupe, French Caribbean. A Next.js PWA that shows real-time beach conditions reported by local partners.

## Features

- **Interactive map** — Full-screen Leaflet map with color-coded beach markers
- **Partner reporting** — Simple token-based URL for hotels/restaurants to report conditions
- **Bilingual** — French (default) and English via next-intl
- **PWA** — Installable on mobile, works offline
- **Satellite fallback** — Weekly cron to scrape sargassum monitoring data

## Tech stack

- Next.js 14 (App Router, TypeScript)
- Leaflet + React-Leaflet + OpenStreetMap
- Supabase (Postgres with RLS)
- Tailwind CSS
- next-intl (i18n)
- next-pwa

## Getting started

```bash
# Clone
git clone git@github.com:xavierosee/borlamer.git
cd borlamer

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the Supabase migration
# (via Supabase CLI or dashboard SQL editor)
# supabase/migrations/001_initial.sql
# supabase/seed.sql

# Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `CRON_SECRET` | Secret for Vercel cron endpoint auth |

## Partner reporting

Partners receive a URL like `/fr/report/their-token-here`. They can report beach conditions (clean/moderate/bad) for any Guadeloupe beach. No login required.

## License

Private project.

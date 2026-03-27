# Borlamer — Product Design Document

## The Problem

Sargassum (brown algae) invasions in the French Caribbean have worsened dramatically since 2011. Massive beachings cause:
- **Health hazard**: Decomposing sargassum releases H₂S (hydrogen sulfide), causing headaches, respiratory issues
- **Tourism impact**: Beaches become unusable, affecting the primary economic driver of the islands
- **Environmental damage**: Seagrass beds and coral reefs suffocated by algae mats

Residents and tourists currently rely on word-of-mouth, local Facebook groups, or physically driving to a beach to check conditions. There is no centralized, real-time tracking tool.

## Who uses it?

1. **Tourists** visiting Martinique, Guadeloupe, Saint-Martin — checking which beaches are usable today
2. **Residents** planning weekend outings, especially families
3. **Tourism operators** (hotels, boat tours, beach restaurants) monitoring conditions
4. **Municipal authorities** tracking cleanup needs

## The Product

Borlamer is a mobile-first web app that shows sargassum alert levels for 24+ beaches across the French Caribbean.

### Core Flow
1. Open app → see map of French Caribbean with color-coded beach markers
2. Tap a beach → see alert level, description, health warnings
3. Switch to list view → filter by island, sort by severity
4. Submit a report → pin your observation (with optional photo) to a beach

### What makes it work
- **Satellite + community hybrid**: NOAA/USF satellite data gives ocean-level forecasts; community reports give beach-level ground truth
- **Offline-first**: Works without internet (cached map tiles, local data). Critical for beach use
- **Simple UI**: Five clear alert levels with color coding. No jargon. French language
- **Health warnings**: Explicit H₂S warnings at high/critical levels

## Narrowest Wedge

MVP focuses exclusively on the French Caribbean (Martinique, Guadeloupe, dependencies). This is:
- Small enough to cover comprehensively (24 beaches)
- Has the worst sargassum problem in the Caribbean
- French-speaking community (single language to start)
- Personal connection (Xavier's family)

## Status Quo

What people do today:
- Check Facebook groups ("Sargasses Martinique")
- Call hotels/friends
- Drive to the beach and find out
- Check NOAA SEAS bulletins (English, technical, bi-weekly — not useful for daily planning)

Borlamer replaces all of this with a single app open.

## Stack Rationale (CEO lens)

- **PWA**: No app store friction. Share a URL. Install from browser. One developer.
- **Free mapping**: Leaflet + OSM. Zero marginal cost at any scale.
- **Open data**: NOAA, Copernicus, community. No data licensing cost.
- **Seasonal model fallback**: Even without API connectivity, the app shows reasonable estimates based on sargassum seasonality.

## Success Metric

Can someone visiting Martinique for the first time open Borlamer and decide which beach to go to within 30 seconds?

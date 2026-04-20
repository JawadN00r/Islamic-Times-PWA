# Islamic Times PWA - Copilot Instructions

## Project Overview
A Progressive Web App (PWA) displaying Islamic prayer times (Salat) for Dhaka, Bangladesh. Built with vanilla JavaScript, SCSS, and Gulp build system. Hosted on Vercel and Cloudflare Pages.

## Architecture
- **No framework** — vanilla JS with direct DOM manipulation
- **Data loading** — `fetch()` API loads JSON data files at runtime
- **Service Worker** — stale-while-revalidate caching with client notification on data updates
- **Build** — Gulp 4 for SCSS compilation, JS minification, and cache busting
- **Styling** — SCSS compiled to CSS, BEM-adjacent naming

## Key Files
- `index.html` — Single-page entry point with prayer times table (Bengali labels)
- `scripts/index.js` — Core logic: date calculations, Hijri conversion, DOM rendering
- `serviceworker.js` — PWA caching, offline support, data update notifications
- `SalatTimeTable24.json` — 365-day prayer time data (Dhaka only)
- `english_hijri_mapping.json` — Reference anchor for Hijri date conversion
- `styles/style.scss` — Dark theme with gradient overlay, responsive table
- `gulpfile.js` — Build tasks (scss, js minification, dist, browsersync)

## Conventions
- Prayer times are calculated from base times + minute offsets (constants at top of index.js)
- Hijri dates advance at sunset (maghrib time minus 3 minutes)
- Prayer-time table labels and date strings are in Bengali; keep new user-facing text consistent with the surrounding UI instead of introducing random English labels
- Date construction uses `new Date().setHours()` — never use string-based `new Date("datestring")` parsing (cross-platform incompatible)
- Data files are pure JSON — never wrap in JS variable assignments
- Service worker should only cache same-origin HTTP(S) `GET` requests — never attempt to cache `POST`, `chrome-extension://`, or other unsupported request schemes
- Service worker should only notify clients via `postMessage({ type: 'DATA_UPDATED' })` when the JSON data content actually changes, otherwise it can create a client refresh/fetch loop

## Important Notes
- `english_hijri_mapping.json` must be manually updated when Hijri calendar corrections occur (moon sighting based)
- Prayer times are specific to Dhaka district only (source: Islamic Research Center Bangladesh)
- The app assumes the user's system timezone is Bangladesh Standard Time (UTC+6)
- Do not add axios or any HTTP client library — use native `fetch()` API
- Do not add React or any UI framework — keep vanilla JS for minimal bundle size

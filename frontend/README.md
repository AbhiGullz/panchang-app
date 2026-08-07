# Panchang PWA Frontend

React + Vite + TypeScript PWA for the Panchang backend.

## Stack
- React 19 + Vite + TypeScript
- Tailwind CSS v4
- TanStack Query + Zustand
- i18next for UI chrome in 10 languages
- vite-plugin-pwa for manifest + service worker + offline API runtime caching
- Vitest + Testing Library

## Build location rule
- Do not run `npm install` on `/home/abhishek/Software Pipeline/...` because that path is on an sshfs mount and `node_modules` creation fails with EPERM/TAR_ENTRY_ERROR.
- Install dependencies and build only on local disk at `/home/abhishek/panchang-frontend`.
- The shared folder `/home/abhishek/Software Pipeline/PanchangApp/frontend` remains the source-of-truth for source files only.
- Never sync `node_modules/` or `dist/` back to the sshfs mount.

## Setup
1. Work from the local build copy:
   `cd /home/abhishek/panchang-frontend`
2. Install dependencies:
   `npm install`
3. Start dev server:
   `npm run dev`
4. Build production bundle:
   `npm run build`
5. Run tests:
   `npm run test`
6. Sync source changes back to the shared folder only:
   `rsync -av --exclude node_modules --exclude dist /home/abhishek/panchang-frontend/ "/home/abhishek/Software Pipeline/PanchangApp/frontend/"`

## API config
- Dev proxy is configured in `vite.config.ts`
- `/api/v1/*` proxies to `http://127.0.0.1:8000`
- Frontend expects backend contract as-is:
  - `GET /api/v1/panchang`
  - `GET /api/v1/muhurta`
  - `GET /api/v1/festivals`

## Env vars
Optional `.env` values:
- `VITE_VAPID_PUBLIC_KEY` — public VAPID key for real Web Push subscription flow

## Features implemented
- Onboarding with city picker, geolocation fallback, calendar school selector, language selector
- Today screen with tithi/nakshatra cards and tradition metadata visibility
- Date picker for today/tomorrow/any date
- Muhurta tab with category selector and disclaimer
- Festivals tab with annual list
- Settings with language, calendar school, notification time, ayanamsa, push subscribe button, and calculation link
- Offline cache path:
  - service worker runtime caches API requests for 7 days
  - indexedDB stores fetched daily panchang payloads for offline fallback
- Push notifications:
  - browser subscribe flow implemented locally
  - backend endpoint for persisting subscriptions is still needed

## Notes
- Backend currently has no `/api/v1/location` endpoint wired in this repo snapshot, so onboarding uses bundled manual city options plus a lightweight local reverse-geo heuristic for geolocation labeling.
- Backend `festivals` response shape is consumed generically (`name`, `date`, optional notes). If richer fields are standardized later, the list can display them easily.
- UI chrome is localized by i18next; panchang names are read from backend localized fields.

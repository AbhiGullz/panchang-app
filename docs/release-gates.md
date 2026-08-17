# Release Gates

This document is the required release evidence for the Panchang web app. Passing local tests is necessary but does not authorize public release.

## Closed in repository

- Frontend uses a committed npm lockfile and the backend has direct dependency pins plus a reviewed Python 3.12 lock snapshot.
- Geocoding has bounded request/response handling, a reverse-lookup cache, provider timeout, and in-process per-client protection. Production must add edge rate limiting.
- Panchang and Muhurta endpoints validate IANA timezone input before cache/calculation use.
- Offline daily-cache keys include the engine/names cache version.
- Moon illumination is a physical illuminated fraction, not phase progress.
- The incomplete local-only Web Push control is not exposed in the UI.

## Required before public beta

1. **Swiss Ephemeris commercial licence:** record licence number, purchaser, covered products (web/PWA/native), version, data-file source, SHA-256 hashes, and required notices. The approved release path is the Professional License; do not activate public service under an unresolved licence choice.
2. **Deployment evidence on H Kamgar:** record a successful `git fetch`, clean install, backend/frontend test output, deployed health check, HTTPS check, independent-node API smoke test, service restart, rollback, and backup restore.
3. **Edge configuration:** configure HTTPS, secret storage, request-size limits, trusted-proxy handling, and per-IP rate limits for `/api/v1/geocode` and `/api/v1/reverse-geocode`.
4. **Ephemeris data inventory:** deploy the documented `.se1` files, verify their hashes before release, and retain their provenance and licence notices outside Git (the binaries are intentionally ignored).
5. **Privacy/monetization:** leave advertising disabled until consent, disclosure, regional handling, and vendor review are complete. Leave push disabled until a server-side VAPID registration, consent, unsubscribe, failure cleanup, and scheduling design is implemented.

## Verification commands

```text
git fetch origin
git status --branch --short
cd frontend && npm ci && npm test && npm run build && npm run lint
PYTHONPATH=backend backend/.venv/bin/python -m pytest backend/tests -q
bash backend/tests/e2e_smoke.sh
```

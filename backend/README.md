# Panchang Calculation Engine

This backend milestone contains the Swiss Ephemeris-based calculation engine for daily panchang generation.

## Setup

1. Use Python 3.12.
2. Create the virtual environment: `python3.12 -m venv backend/.venv`
3. Install the reviewed development lock: `backend/.venv/bin/python -m pip install -r backend/requirements.lock`
4. Place the licensed Swiss Ephemeris data files in `backend/data/`:
   - `seas_18.se1`
   - `semo_18.se1`
   - `sepl_18.se1`
5. Run the full backend tests:
   `PYTHONPATH=backend backend/.venv/bin/python -m pytest backend/tests -q`
6. Run the HTTP smoke test:
   `bash backend/tests/e2e_smoke.sh`

## Location search

`GET /api/v1/geocode` and `GET /api/v1/reverse-geocode` proxy debounced, limited searches to OpenStreetMap Nominatim. The backend sends the descriptive `PanchangApp/0.1` User-Agent, keeps a bounded five-minute cache (including reverse lookups), applies a one-request-per-second process-level upstream throttle, and applies a 30-requests-per-minute in-process per-client guard. The reverse proxy must enforce the production rate limit too, because in-process limits do not span workers. Do not bulk preload or autocomplete against Nominatim; respect its usage policy and attribution requirements: https://operations.osmfoundation.org/policies/nominatim/.

All `tz` inputs are explicitly validated as IANA time zone names before cache or calculation use. The API derives time zones from coordinates for geocoding; callers that supply coordinates and a timezone directly are responsible for choosing the correct local zone at a border.

## Licence and private phone testing

This repository follows the **AGPL-3.0-or-later** route for Swiss Ephemeris. Keeping the Git repository public is necessary but not sufficient: every deployed web version must provide the complete corresponding source, preserve required notices, and publish any modifications under the AGPL. Review the project-level AGPL notice and source-offer process before sharing outside the private tailnet.

To test privately on a phone that is in the same Tailscale tailnet, build the frontend, start the API with `PANCHANG_FRONTEND_DIST` pointing to `frontend/dist`, then run `tailscale serve --bg --https=443 http://127.0.0.1:8000`. The resulting `https://<node>.<tailnet>.ts.net` URL is private to the tailnet; do not use Tailscale Funnel for this test.

## Module map

- `engine/core.py` — Swiss Ephemeris init, Julian day helpers, daily panchang orchestrator
- `engine/tithi.py` — tithi and karana calculations from Moon-Sun phase
- `engine/nakshatra.py` — nakshatra and pada from sidereal Moon longitude
- `engine/yoga.py` — yoga from sidereal Sun + Moon longitude
- `engine/rashi.py` — moon sign from sidereal Moon longitude
- `engine/muhurta.py` — rahu kaal and abhijit muhurta windows
- `engine/sunrise.py` — sunrise/sunset/moonrise/moonset computation with Swiss Ephemeris
- `engine/transitions.py` — independent local-time boundary search and 30-state lunar phase mapping
- `engine/models.py` — Pydantic response schemas
- `tests/test_engine.py` — Delhi/London smoke test for 2026-08-03

## Notes

- Ayanamsa is set to Lahiri in `engine/core.py`.
- Current smoke test checks successful computation and prints readable output.
- Exact-value fixture assertions are deferred to Milestone 2.

# Panchang Calculation Engine

This backend milestone contains the Swiss Ephemeris-based calculation engine for daily panchang generation.

## Setup

1. Install uv if needed: `curl -fsSL https://astral.sh/uv/install.sh | sh`
2. Create the virtual environment:
   `uv venv backend/.venv`
3. Install dependencies:
   `uv pip install --python backend/.venv/bin/python -r backend/requirements.txt`
4. Place Swiss Ephemeris data files in `backend/data/`:
   - `seas_18.se1`
   - `semo_18.se1`
   - `sepl_18.se1`
5. Run the smoke test:
   `backend/.venv/bin/python -m pytest backend/tests/test_engine.py -s -q`

## Location search

`GET /api/v1/geocode` proxies debounced, limited searches to OpenStreetMap Nominatim. The backend sends the descriptive `PanchangApp/0.1` User-Agent, keeps a short cache and one-request-per-second process-level throttle, and returns only validated results with an IANA timezone resolved offline by `timezonefinder` and Python `zoneinfo`. `GET /api/v1/reverse-geocode` uses the same provider and timezone validation for browser geolocation. Do not bulk preload or autocomplete against Nominatim; respect its usage policy and attribution requirements: https://operations.osmfoundation.org/policies/nominatim/.

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

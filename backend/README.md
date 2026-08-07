# Panchang Calculation Engine

This backend milestone contains the Swiss Ephemeris-based calculation engine for daily panchang generation.

## Setup

1. Install uv if needed: `curl -fsSL https://astral.sh/uv/install.sh | sh`
2. Create the virtual environment:
   `uv venv backend/.venv`
3. Install dependencies:
   `uv pip install --python backend/.venv/bin/python pyswisseph pydantic pytest`
4. Place Swiss Ephemeris data files in `backend/data/`:
   - `seas_18.se1`
   - `semo_18.se1`
   - `sepl_18.se1`
5. Run the smoke test:
   `backend/.venv/bin/python -m pytest backend/tests/test_engine.py -s -q`

## Module map

- `engine/core.py` — Swiss Ephemeris init, Julian day helpers, daily panchang orchestrator
- `engine/tithi.py` — tithi and karana calculations from Moon-Sun phase
- `engine/nakshatra.py` — nakshatra and pada from sidereal Moon longitude
- `engine/yoga.py` — yoga from sidereal Sun + Moon longitude
- `engine/rashi.py` — moon sign from sidereal Moon longitude
- `engine/muhurta.py` — rahu kaal and abhijit muhurta windows
- `engine/sunrise.py` — sunrise/sunset computation with Swiss Ephemeris
- `engine/models.py` — Pydantic response schemas
- `tests/test_engine.py` — Delhi/London smoke test for 2026-08-03

## Notes

- Ayanamsa is set to Lahiri in `engine/core.py`.
- Current smoke test checks successful computation and prints readable output.
- Exact-value fixture assertions are deferred to Milestone 2.

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PYTHON_BIN="${PYTHON_BIN:-.venv/bin/python}"
if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "Python environment not found: $PYTHON_BIN" >&2
  exit 1
fi

PORT=8899
BASE="http://127.0.0.1:${PORT}"
STARTED_BY_SCRIPT=0
UVICORN_PID=""

cleanup() {
  if [[ "$STARTED_BY_SCRIPT" -eq 1 && -n "$UVICORN_PID" ]] && kill -0 "$UVICORN_PID" 2>/dev/null; then
    kill "$UVICORN_PID" 2>/dev/null || true
    wait "$UVICORN_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if ! curl -fsS "$BASE/api/v1/health" >/dev/null 2>&1; then
  PYTHONPATH="$ROOT_DIR" "$PYTHON_BIN" -m uvicorn api.main:app --host 127.0.0.1 --port "$PORT" >/tmp/panchang-e2e-uvicorn.log 2>&1 &
  UVICORN_PID=$!
  STARTED_BY_SCRIPT=1
  for _ in {1..30}; do
    if curl -fsS "$BASE/api/v1/health" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

curl -fsS "$BASE/api/v1/health" | python -c 'import json,sys; d=json.load(sys.stdin); assert d["status"]=="ok" and "version" in d'

curl -fsS "$BASE/api/v1/panchang?date=2027-01-14&lat=28.6139&lng=77.2090&tz=Asia/Kolkata&calendar=purnimanta&lang=en" | python -c 'import json,sys; d=json.load(sys.stdin); assert d["date"]=="2027-01-14"; assert d["location"]["tz"]=="Asia/Kolkata"; assert "tithi" in d and "nakshatra" in d and "rahu_kaal" in d'

curl -fsS "$BASE/api/v1/panchang?date=2027-10-31&lat=51.5074&lng=-0.1278&tz=Europe/London&calendar=amanta&lang=en" | python -c 'import json,sys; d=json.load(sys.stdin); assert d["location"]["tz"]=="Europe/London"; assert d["month_name"]["en"]; assert d["paksha"] in ("Shukla","Krishna")'

curl -fsS "$BASE/api/v1/panchang?date=2027-03-14&lat=-33.8688&lng=151.2093&tz=Australia/Sydney&calendar=nanakshahi&lang=en" | python -c 'import json,sys; d=json.load(sys.stdin); assert d["location"]["tz"]=="Australia/Sydney"; assert d["month_name"]["en"]; assert d["era_year"] >= 500'

curl -fsS "$BASE/api/v1/festivals?year=2027&calendar=amanta&lang=en" | python -c 'import json,sys; d=json.load(sys.stdin); assert d["year"]==2027; assert isinstance(d["festivals"], list) and len(d["festivals"])>0; assert any(f["name"]=="Diwali" for f in d["festivals"])'

curl -fsS "$BASE/api/v1/muhurta?date=2027-01-14&lat=28.6139&lng=77.2090&tz=Asia/Kolkata&category=wedding&calendar=purnimanta" | python -c 'import json,sys; d=json.load(sys.stdin); assert d["category"]=="wedding"; assert "guidance" in d; assert "windows" in d'

echo "E2E smoke PASS"

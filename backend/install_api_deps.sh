#!/usr/bin/env bash
set -euo pipefail
cd "/home/abhishek/Software Pipeline/PanchangApp/backend"
. .venv/bin/activate
python -m pip install fastapi redis httpx uvicorn

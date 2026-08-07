from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import os
import pytest

# Disable Redis cache in tests: TestClient event-loop isolation makes the
# async Redis client bind to a closed loop -> "Event loop is closed".
# Cache is a performance layer only; tests exercise compute correctness.
os.environ.setdefault("PANCHANG_DISABLE_CACHE", "1")

@pytest.fixture(autouse=True)
def _disable_cache():
    os.environ["PANCHANG_DISABLE_CACHE"] = "1"
    yield

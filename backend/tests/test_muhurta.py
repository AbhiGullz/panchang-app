from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from api.main import app
from engine.muhurta import (
    compute_category_windows,
    compute_gulika_kaal,
    compute_rahu_kaal,
    compute_yamagandam,
)

client = TestClient(app)


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


def test_rahu_kaal_known_monday_window():
    sunrise = _dt("2026-08-03T05:40:00")
    sunset = _dt("2026-08-03T19:00:00")
    assert compute_rahu_kaal(sunrise, sunset) == {"start": "07:20", "end": "09:00"}


def test_yamagandam_known_monday_window():
    sunrise = _dt("2026-08-03T05:40:00")
    sunset = _dt("2026-08-03T19:00:00")
    assert compute_yamagandam(sunrise, sunset) == {"start": "10:40", "end": "12:20"}


def test_gulika_known_monday_window():
    sunrise = _dt("2026-08-03T05:40:00")
    sunset = _dt("2026-08-03T19:00:00")
    assert compute_gulika_kaal(sunrise, sunset) == {"start": "14:00", "end": "15:40"}


@pytest.mark.parametrize(
    "category",
    ["wedding", "griha-pravesh", "travel", "naming", "vehicle", "property"],
)
def test_category_windows_are_sensible(category: str):
    panchang = {
        "date": "2026-08-03",
        "sun": {"rise": "05:40", "set": "19:00"},
        "tithi": {"index": 12, "name": "Shukla Dwadashi", "ends_at": None},
        "nakshatra": {"index": 13, "name": "Hasta", "pada": 2},
        "yoga": {"index": 16, "name": "Siddhi"},
        "muhurta": {
            "abhijit": {"start": "12:00", "end": "12:48"},
            "yamagandam": {"start": "10:40", "end": "12:20"},
            "gulika": {"start": "14:00", "end": "15:40"},
            "amrit_kala": {"start": "07:06", "end": "07:54"},
        },
        "rahu_kaal": {"start": "07:20", "end": "09:00"},
    }

    windows = compute_category_windows(panchang, category)

    assert windows
    for window in windows:
        assert window["start"] < window["end"]
        assert window["reference"] == "calculated timing reference"
        assert "notes" in window


def test_muhurta_endpoint_supports_category():
    response = client.get(
        "/api/v1/muhurta",
        params={
            "date": "2026-08-03",
            "lat": 28.6139,
            "lng": 77.2090,
            "tz": "Asia/Kolkata",
            "category": "travel",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["category"] == "travel"
    assert body["windows"] == [] or all(window["reference"] == "calculated timing reference" for window in body["windows"])
    assert body["guidance"] == "Calculated timing reference only; not a claim of religious authority."


def test_muhurta_endpoint_returns_next_ten_after_empty_selected_day(monkeypatch):
    def fake_panchang(*, date_iso, **kwargs):
        return {"date": date_iso}

    def fake_windows(panchang, category):
        if panchang["date"] == "2026-08-03":
            return []
        return [{"start": "09:00", "end": "10:00", "label": "Travel"}]

    monkeypatch.setattr("api.main.compute_daily_panchang", fake_panchang)
    monkeypatch.setattr("api.main.compute_category_windows", fake_windows)
    response = client.get("/api/v1/muhurta", params={"date": "2026-08-03", "lat": 28, "lng": 77, "tz": "Asia/Kolkata"})

    assert response.status_code == 200
    windows = response.json()["windows"]
    assert len(windows) == 10
    assert windows[0]["date"] == "2026-08-04"
    assert [window["date"] for window in windows] == sorted(window["date"] for window in windows)

import pytest
from fastapi.testclient import TestClient

pytest.importorskip("api.main")
from api.main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "0.3.0"}


def test_panchang_endpoint_returns_payload():
    response = client.get(
        "/api/v1/panchang",
        params={
            "date": "2026-08-03",
            "lat": 28.6139,
            "lng": 77.2090,
            "tz": "Asia/Kolkata",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "tithi" in body
    assert "nakshatra" in body


def test_panchang_endpoint_accepts_all_eight_calendar_schools():
    calendars = [
        "purnimanta",
        "amanta",
        "gujarati",
        "marathi",
        "nanakshahi",
        "tamil",
        "malayalam",
        "bengali",
    ]

    for calendar in calendars:
        response = client.get(
            "/api/v1/panchang",
            params={
                "date": "2026-08-03",
                "lat": 28.6139,
                "lng": 77.2090,
                "tz": "Asia/Kolkata",
                "calendar": calendar,
            },
        )
        assert response.status_code == 200
        body = response.json()
        assert body["month_name"]
        assert isinstance(body["era_year"], int)
        if calendar in {"nanakshahi", "tamil", "malayalam"}:
            assert body["paksha"] is None
        else:
            assert body["paksha"] in {"Shukla", "Krishna"}


def test_invalid_date_returns_422():
    response = client.get(
        "/api/v1/panchang",
        params={
            "date": "2026/08/03",
            "lat": 28.6139,
            "lng": 77.2090,
            "tz": "Asia/Kolkata",
        },
    )
    assert response.status_code == 422

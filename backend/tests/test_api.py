import pytest
from datetime import date
from fastapi.testclient import TestClient

pytest.importorskip("api.main")
from api.main import app, _cache_key

client = TestClient(app)


def test_geocode_rejects_empty_and_overlong_queries():
    assert client.get("/api/v1/geocode", params={"q": ""}).status_code == 422
    assert client.get("/api/v1/geocode", params={"q": "x" * 121}).status_code == 422


def test_geocode_returns_validated_results(monkeypatch):
    async def fake_provider(query: str, limit: int, lang: str = "en"):
        return [{"display_name": "Delhi, India", "lat": 28.6139, "lon": 77.209}]

    monkeypatch.setattr("api.main._search_nominatim", fake_provider)
    response = client.get("/api/v1/geocode", params={"q": "Delhi"})
    assert response.status_code == 200
    assert response.json()[0]["display_name"] == "Delhi, India"
    assert response.json()[0]["lat"] == 28.6139
    assert response.json()[0]["tz"] == "Asia/Kolkata"


def test_geocode_provider_failure_is_not_leaked(monkeypatch):
    async def failing_provider(query: str, limit: int, lang: str = "en"):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr("api.main._search_nominatim", failing_provider)
    response = client.get("/api/v1/geocode", params={"q": "London"})
    assert response.status_code == 502
    assert response.json()["detail"] == "Location search is temporarily unavailable."


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


def test_invalid_coordinates_return_422():
    response = client.get(
        "/api/v1/panchang",
        params={"date": "2026-08-03", "lat": 91, "lng": 77, "tz": "Asia/Kolkata"},
    )
    assert response.status_code == 422


def test_invalid_timezone_is_rejected_before_calculation():
    response = client.get(
        "/api/v1/panchang",
        params={"date": "2026-08-03", "lat": 28.6139, "lng": 77.209, "tz": "Not/AZone"},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "tz must be a valid IANA timezone name."


def test_muhurta_rejects_invalid_timezone_before_calculation():
    response = client.get(
        "/api/v1/muhurta",
        params={"date": "2026-08-03", "lat": 28.6139, "lng": 77.209, "tz": "Not/AZone"},
    )
    assert response.status_code == 422


def test_festivals_reject_unknown_language():
    response = client.get("/api/v1/festivals", params={"year": 2026, "lang": "xx"})
    assert response.status_code == 400


def test_muhurta_rejects_unknown_category():
    response = client.get(
        "/api/v1/muhurta",
        params={
            "date": "2026-08-03",
            "lat": 28.6139,
            "lng": 77.2090,
            "tz": "Asia/Kolkata",
            "category": "not-a-category",
        },
    )
    assert response.status_code == 400


def test_cache_key_preserves_close_coordinates():
    first = _cache_key(date(2026, 8, 3), 28.611, 77.209, "Asia/Kolkata", "amanta", "en")
    second = _cache_key(date(2026, 8, 3), 28.619, 77.209, "Asia/Kolkata", "amanta", "en")
    assert first != second

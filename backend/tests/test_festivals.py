import json
from pathlib import Path

from fastapi.testclient import TestClient

from api.main import app
from engine.festivals import compute_festivals_for_year

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "festival_golden.json"
client = TestClient(app)


def _golden_map():
    data = json.loads(FIXTURE_PATH.read_text())
    return {item["name"]: item for item in data["fixtures"]}


def test_festival_engine_matches_golden_dates_2027():
    golden = _golden_map()
    actual = {item["name"]: item for item in compute_festivals_for_year(2027, calendar="amanta", lang="en")}

    assert set(golden) == set(actual)
    for name, expected in golden.items():
        assert actual[name]["date"] == expected["date"]


def test_festivals_endpoint_returns_annual_calendar():
    response = client.get("/api/v1/festivals", params={"year": 2027, "calendar": "amanta", "lang": "en"})
    assert response.status_code == 200
    body = response.json()
    assert body["year"] == 2027
    assert len(body["festivals"]) == 15
    assert any(item["name"] == "Diwali" for item in body["festivals"])


def test_festival_tradition_and_language_change_calculated_data():
    amanta = client.get("/api/v1/festivals", params={"year": 2027, "calendar": "amanta", "lang": "en"}).json()
    marathi = client.get("/api/v1/festivals", params={"year": 2027, "calendar": "marathi", "lang": "mr"}).json()
    amanta_diwali = next(item for item in amanta["festivals"] if item["name"] == "Diwali")
    marathi_diwali = next(item for item in marathi["festivals"] if item["name"] == "Diwali")

    assert marathi["calendar"] == "marathi"
    assert marathi_diwali["lunar_month"] != amanta_diwali["lunar_month"]
    assert marathi_diwali["localized_name"] == "दिवाळी"

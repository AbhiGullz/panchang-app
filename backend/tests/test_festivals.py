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

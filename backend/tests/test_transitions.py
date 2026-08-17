from datetime import datetime
import json
from pathlib import Path

import pytest

from engine.core import compute_daily_panchang


@pytest.mark.parametrize(
    ("city", "latitude", "longitude", "timezone_name"),
    [
        ("Flemington", 40.5123, -74.8590, "America/New_York"),
        ("Pune", 18.5204, 73.8567, "Asia/Kolkata"),
    ],
)
def test_transition_payload_uses_aware_iso_timestamps(city, latitude, longitude, timezone_name):
    result = compute_daily_panchang(
        date_iso="2026-08-15",
        latitude=latitude,
        longitude=longitude,
        timezone_name=timezone_name,
        location_name=city,
    )

    assert result["timing_metadata"]["timezone"] == timezone_name
    assert result["timing_metadata"]["ayanamsa"] == "Lahiri"
    assert result["tithi"]["start"] < result["tithi"]["end"]
    assert result["nakshatra"]["start"] < result["nakshatra"]["end"]
    assert result["yoga"]["start"] < result["yoga"]["end"]
    assert datetime.fromisoformat(result["sun"]["rise_at"]).utcoffset() is not None
    assert datetime.fromisoformat(result["sun"]["set_at"]).utcoffset() is not None
    assert result["phase"]["state"] in range(30)


def test_karana_boundaries_are_ordered_and_labels_advance():
    result = compute_daily_panchang(
        date_iso="2026-08-15",
        latitude=40.5123,
        longitude=-74.8590,
        timezone_name="America/New_York",
        location_name="Flemington",
    )

    transitions = result["karana"]["transitions"]
    assert all(item["at"] < next_item["at"] for item, next_item in zip(transitions, transitions[1:]))
    assert all(item["name"] != next_item["name"] for item, next_item in zip(transitions, transitions[1:]))
    assert result["karana"]["next"]


def test_transition_fixture_labels_offsets_and_local_date_rollover():
    fixture_path = Path(__file__).parent / "fixtures" / "transition_fixtures.json"
    for fixture in json.loads(fixture_path.read_text())["fixtures"]:
        result = compute_daily_panchang(
            date_iso=fixture["date"],
            latitude=fixture["lat"],
            longitude=fixture["lng"],
            timezone_name=fixture["tz"],
            location_name=fixture["city"],
        )
        assert result["tithi"]["name"]["en"] == fixture["tithi"]
        assert result["nakshatra"]["name"]["en"] == fixture["nakshatra"]
        assert result["yoga"]["name"]["en"] == fixture["yoga"]
        assert result["karana"]["name"]["en"] == fixture["karana"]
        assert result["sun"]["rise_at"].endswith(fixture["expected_offset"])
        if fixture["city"] == "Pune":
            assert result["nakshatra"]["end"].startswith("2026-08-16T")


def test_moon_events_are_explicit_when_supported():
    result = compute_daily_panchang(
        date_iso="2026-08-15",
        latitude=18.5204,
        longitude=73.8567,
        timezone_name="Asia/Kolkata",
        location_name="Pune",
    )

    assert "moonrise_at" in result["sun"]
    assert "moonset_at" in result["sun"]
    if result["sun"]["moonrise_at"]:
        assert datetime.fromisoformat(result["sun"]["moonrise_at"]).utcoffset() is not None


def test_illumination_is_a_fraction_not_phase_progress():
    result = compute_daily_panchang(
        date_iso="2026-08-15",
        latitude=18.5204,
        longitude=73.8567,
        timezone_name="Asia/Kolkata",
        location_name="Pune",
    )

    assert 0 <= result["phase"]["illumination"] <= 1

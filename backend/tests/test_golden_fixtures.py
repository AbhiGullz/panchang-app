import json
from datetime import datetime
from pathlib import Path

import pytest

from engine.core import compute_daily_panchang

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "drikpanchang_golden.json"


def _load_cases():
    data = json.loads(FIXTURE_PATH.read_text())
    return data["fixtures"]


def _minutes(value: str) -> int:
    parsed = datetime.strptime(value, "%H:%M")
    return parsed.hour * 60 + parsed.minute


def _delta_minutes(a: str, b: str) -> int:
    return abs(_minutes(a) - _minutes(b))


@pytest.mark.parametrize(
    "case",
    _load_cases(),
    ids=lambda case: f"{case['city']}-{case['date']}",
)
def test_golden_fixture_match(case):
    result = compute_daily_panchang(
        date_iso=case["date"],
        latitude=case["lat"],
        longitude=case["lng"],
        timezone_name=case["tz"],
        location_name=case["city"],
    )

    failures = []
    tithi_name = result["tithi"]["name"]["en"]
    nakshatra_name = result["nakshatra"]["name"]["en"]
    yoga_name = result["yoga"]["name"]["en"]
    karana_name = result["karana"]["name"]["en"]
    moon_sign_name = result["moon_sign"]["en"]

    if tithi_name != case["tithi"]["name"] or result["tithi"]["index"] != case["tithi"]["index"]:
        failures.append(
            f"tithi expected {case['tithi']} got {{'index': {result['tithi']['index']}, 'name': {tithi_name!r}}}"
        )

    actual_nakshatra = {"name": nakshatra_name, "pada": result["nakshatra"]["pada"]}
    if actual_nakshatra != case["nakshatra"]:
        failures.append(f"nakshatra expected {case['nakshatra']} got {actual_nakshatra}")

    if yoga_name != case["yoga"]:
        failures.append(f"yoga expected {case['yoga']} got {yoga_name}")

    if karana_name != case["karana"]:
        failures.append(f"karana expected {case['karana']} got {karana_name}")

    if moon_sign_name != case["moon_sign"]:
        failures.append(f"moon_sign expected {case['moon_sign']} got {moon_sign_name}")

    sunrise_delta = _delta_minutes(result["sun"]["rise"], case["sunrise"])
    if sunrise_delta > 5:
        failures.append(
            f"sunrise expected {case['sunrise']} got {result['sun']['rise']} (delta {sunrise_delta}m)"
        )

    sunset_delta = _delta_minutes(result["sun"]["set"], case["sunset"])
    if sunset_delta > 5:
        failures.append(
            f"sunset expected {case['sunset']} got {result['sun']['set']} (delta {sunset_delta}m)"
        )

    actual_rahu = result["rahu_kaal"]
    rahu_start_delta = _delta_minutes(actual_rahu["start"], case["rahu_kaal"]["start"])
    rahu_end_delta = _delta_minutes(actual_rahu["end"], case["rahu_kaal"]["end"])
    if rahu_start_delta > 1 or rahu_end_delta > 1:
        failures.append(
            f"rahu_kaal expected {case['rahu_kaal']} got {actual_rahu} "
            f"(delta {rahu_start_delta}m/{rahu_end_delta}m)"
        )

    summary = f"{'PASS' if not failures else 'FAIL'} {case['city']} {case['date']}"
    print(summary)
    if failures:
        pytest.fail(summary + " :: " + " | ".join(failures))

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

RAHU_SEGMENTS = {
    0: 2,
    1: 7,
    2: 5,
    3: 6,
    4: 4,
    5: 3,
    6: 8,
}

YAMAGANDAM_SEGMENTS = {
    0: 4,
    1: 3,
    2: 2,
    3: 1,
    4: 7,
    5: 6,
    6: 5,
}

GULIKA_SEGMENTS = {
    0: 6,
    1: 5,
    2: 4,
    3: 3,
    4: 2,
    5: 1,
    6: 7,
}

DISHA_SHOOL = {
    0: "East",
    1: "North",
    2: "North",
    3: "South",
    4: "West",
    5: "East",
    6: "West",
}

AUSPICIOUS_TITHIS = {
    "wedding": {2, 3, 5, 7, 10, 11, 12, 13},
    "griha-pravesh": {2, 3, 5, 7, 10, 11, 12},
    "travel": {2, 5, 7, 10, 11, 12, 13},
    "naming": {2, 3, 5, 7, 10, 11, 12},
    "vehicle": {2, 3, 5, 7, 10, 11, 12, 13},
    "property": {2, 3, 5, 7, 10, 11, 12, 13},
}

AUSPICIOUS_NAKSHATRAS = {
    "wedding": {4, 11, 12, 13, 15, 17, 21, 22, 27},
    "griha-pravesh": {4, 7, 10, 12, 13, 15, 17, 22, 24},
    "travel": {2, 4, 7, 13, 15, 22, 24, 27},
    "naming": {1, 4, 5, 7, 8, 13, 22, 27},
    "vehicle": {2, 4, 7, 13, 15, 22, 24},
    "property": {4, 7, 10, 12, 13, 15, 17, 22, 24},
}

AUSPICIOUS_YOGAS = {
    "wedding": {1, 2, 3, 5, 7, 8, 16, 20, 21, 22, 23, 24, 25, 26},
    "griha-pravesh": {1, 2, 3, 5, 7, 8, 16, 20, 21, 22, 23, 24},
    "travel": {1, 2, 3, 7, 8, 16, 21, 22, 23, 24},
    "naming": {1, 2, 3, 5, 7, 8, 16, 20, 21, 22, 23, 24},
    "vehicle": {1, 2, 3, 5, 7, 8, 16, 21, 22, 23, 24},
    "property": {1, 2, 3, 5, 7, 8, 16, 20, 21, 22, 23, 24},
}

CATEGORY_RULES = {
    "wedding": {
        "label": "Vivah",
        "timing_priority": ["abhijit", "amrit_kala"],
        "notes": "Simple rule set based on favourable tithi, nakshatra, yoga and daytime windows.",
    },
    "griha-pravesh": {
        "label": "Griha Pravesh",
        "timing_priority": ["abhijit", "amrit_kala"],
        "notes": "Simple rule set for house-entry planning; excludes inauspicious daytime windows.",
    },
    "travel": {
        "label": "Travel",
        "timing_priority": ["amrit_kala", "abhijit"],
        "notes": "Travel windows prefer Amrit Kala, with Disha Shool surfaced as guidance.",
    },
    "naming": {
        "label": "Namakaran",
        "timing_priority": ["abhijit", "amrit_kala"],
        "notes": "Naming windows use gentle filters only; treat as a computed reference, not religious authority.",
    },
    "vehicle": {
        "label": "Vehicle Purchase",
        "timing_priority": ["abhijit", "amrit_kala"],
        "notes": "Vehicle purchase windows are simplified and traceable to documented filters.",
    },
    "property": {
        "label": "Property Purchase",
        "timing_priority": ["abhijit", "amrit_kala"],
        "notes": "Property windows are a practical reference using favourable tithi, nakshatra and yoga.",
    },
}


def _format(dt: datetime) -> str:
    return dt.strftime("%H:%M")


def _compute_segment_window(sunrise: datetime, sunset: datetime, segment_number: int) -> dict[str, str]:
    day_duration = sunset - sunrise
    segment_duration = day_duration / 8
    start = sunrise + segment_duration * (segment_number - 1)
    end = start + segment_duration
    return {"start": _format(start), "end": _format(end)}


def compute_rahu_kaal(sunrise: datetime, sunset: datetime) -> dict[str, str]:
    return _compute_segment_window(sunrise, sunset, RAHU_SEGMENTS[sunrise.weekday()])


def compute_yamagandam(sunrise: datetime, sunset: datetime) -> dict[str, str]:
    return _compute_segment_window(sunrise, sunset, YAMAGANDAM_SEGMENTS[sunrise.weekday()])


def compute_gulika_kaal(sunrise: datetime, sunset: datetime) -> dict[str, str]:
    return _compute_segment_window(sunrise, sunset, GULIKA_SEGMENTS[sunrise.weekday()])


def compute_abhijit_muhurta(sunrise: datetime, sunset: datetime) -> dict[str, str]:
    midday = sunrise + (sunset - sunrise) / 2
    window = timedelta(minutes=24)
    return {"start": _format(midday - window), "end": _format(midday + window)}


def compute_amrit_kala(sunrise: datetime, sunset: datetime, yoga_index: int) -> dict[str, str]:
    day_duration = sunset - sunrise
    start_offset_ratio = ((yoga_index - 1) % 27) / 27
    start = sunrise + day_duration * start_offset_ratio
    end = min(start + timedelta(minutes=48), sunset)
    if end <= start:
        end = start + timedelta(minutes=24)
    return {"start": _format(start), "end": _format(end)}


def compute_disha_shool(target_dt: datetime) -> str:
    return DISHA_SHOOL[target_dt.weekday()]


def compute_category_windows(panchang: dict[str, Any], category: str) -> list[dict[str, str]]:
    rule = CATEGORY_RULES.get(category)
    if rule is None:
        category = "travel"
        rule = CATEGORY_RULES[category]

    tithi_ok = panchang["tithi"]["index"] in AUSPICIOUS_TITHIS[category]
    nakshatra_ok = panchang["nakshatra"]["index"] in AUSPICIOUS_NAKSHATRAS[category]
    yoga_ok = panchang["yoga"]["index"] in AUSPICIOUS_YOGAS[category]

    if not (tithi_ok and nakshatra_ok and yoga_ok):
        return []

    windows: list[dict[str, str]] = []
    for key in rule["timing_priority"]:
        window = panchang["muhurta"].get(key)
        if not window:
            continue
        if key == "abhijit":
            label = "Abhijit Muhurta"
        elif key == "amrit_kala":
            label = "Amrit Kala"
        else:
            label = key.replace("_", " ").title()
        windows.append(
            {
                "start": window["start"],
                "end": window["end"],
                "label": label,
                "reference": "calculated timing reference",
                "notes": rule["notes"],
            }
        )
    return windows

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

LUNAR_MONTHS = [
    "Chaitra",
    "Vaishakha",
    "Jyeshtha",
    "Ashadha",
    "Shravana",
    "Bhadrapada",
    "Ashwin",
    "Kartika",
    "Margashirsha",
    "Pausha",
    "Magha",
    "Phalguna",
]

MONTH_TABLES = {
    "purnimanta": [{"name": name, "script": "Devanagari"} for name in LUNAR_MONTHS],
    "amanta": [{"name": name, "script": "Devanagari"} for name in LUNAR_MONTHS],
    "gujarati": [
        {"name": name, "script": "Gujarati"}
        for name in [
            "Kartak",
            "Magsar",
            "Posh",
            "Maha",
            "Fagun",
            "Chaitra",
            "Vaishakh",
            "Jeth",
            "Ashadh",
            "Shravan",
            "Bhadarvo",
            "Aso",
        ]
    ],
    "marathi": [
        {"name": name, "script": "Devanagari"}
        for name in [
            "Chaitra",
            "Vaishakh",
            "Jyeshtha",
            "Ashadha",
            "Shravana",
            "Bhadrapada",
            "Ashwin",
            "Kartik",
            "Margashirsha",
            "Pausha",
            "Magha",
            "Phalguna",
        ]
    ],
    "nanakshahi": [
        {"name": name, "script": "Gurmukhi"}
        for name in [
            "Chet",
            "Vaisakh",
            "Jeth",
            "Harh",
            "Sawan",
            "Bhadon",
            "Assu",
            "Katak",
            "Maghar",
            "Poh",
            "Magh",
            "Phaggan",
        ]
    ],
    "tamil": [
        {"name": name, "script": "Tamil"}
        for name in ["Chithirai", "Vaikasi", "Aani", "Aadi", "Avani", "Purattasi", "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"]
    ],
    "malayalam": [
        {"name": name, "script": "Malayalam"}
        for name in ["Chingam", "Kanni", "Thulam", "Vrischikam", "Dhanu", "Makaram", "Kumbham", "Meenam", "Medam", "Edavam", "Mithunam", "Karkidakam"]
    ],
    "bengali": [
        {"name": name, "script": "Bengali"}
        for name in ["Boishakh", "Joishtho", "Asharh", "Srabon", "Bhadro", "Ashwin", "Kartik", "Ogrohayon", "Poush", "Magh", "Falgun", "Chaitro"]
    ],
}

PAKSHA_FIRST = {
    "purnimanta": "Krishna",
    "amanta": "Shukla",
    "gujarati": "Shukla",
    "marathi": "Shukla",
    "bengali": "Shukla",
}

NANAKSHAHI_MONTH_STARTS = [
    (3, 14),
    (4, 14),
    (5, 15),
    (6, 15),
    (7, 16),
    (8, 16),
    (9, 15),
    (10, 15),
    (11, 14),
    (12, 14),
    (1, 13),
    (2, 12),
]


@dataclass(frozen=True)
class CalendarSchoolResult:
    month_name: str
    era_year: int
    paksha: str | None


def _lunar_month_index(sun_sidereal_longitude: float) -> int:
    return (int(sun_sidereal_longitude // 30.0) - 11) % 12


def _solar_month_index(sun_sidereal_longitude: float) -> int:
    return int(sun_sidereal_longitude // 30.0) % 12


def _purnimanta_month_name(base_index: int, paksha: str) -> str:
    # In a Purnimanta calendar, the Shukla fortnight belongs to the
    # month that ends at the upcoming Purnima; Krishna begins in the
    # following month immediately after Purnima. The sidereal solar
    # anchor is therefore one month behind during Shukla, not Krishna.
    index = (base_index - 1) % 12 if paksha == "Shukla" else base_index
    return MONTH_TABLES["purnimanta"][index]["name"]


def _amanta_month_name(base_index: int) -> str:
    return MONTH_TABLES["amanta"][base_index]["name"]


def _gujarati_month_name(base_index: int, paksha: str) -> str:
    adjusted_index = base_index if paksha == "Shukla" else (base_index - 1) % 12
    return MONTH_TABLES["gujarati"][(adjusted_index + 5) % 12]["name"]


def _marathi_month_name(base_index: int) -> str:
    return MONTH_TABLES["marathi"][base_index]["name"]


def _nanakshahi_month_and_year(target_date: date) -> tuple[str, int]:
    current_year_starts = [(date(target_date.year, month, day), index) for index, (month, day) in enumerate(NANAKSHAHI_MONTH_STARTS)]
    next_year_chet = date(target_date.year + 1, 3, 14)
    for i, (start_date, month_index) in enumerate(current_year_starts):
        end_date = current_year_starts[i + 1][0] if i + 1 < len(current_year_starts) else next_year_chet
        if start_date <= target_date < end_date:
            era_year = target_date.year - 1469
            return MONTH_TABLES["nanakshahi"][month_index]["name"], era_year

    previous_year_starts = [(date(target_date.year - 1, month, day), index) for index, (month, day) in enumerate(NANAKSHAHI_MONTH_STARTS)]
    for i, (start_date, month_index) in enumerate(previous_year_starts):
        end_date = previous_year_starts[i + 1][0] if i + 1 < len(previous_year_starts) else date(target_date.year, 3, 14)
        if start_date <= target_date < end_date:
            era_year = target_date.year - 1470
            return MONTH_TABLES["nanakshahi"][month_index]["name"], era_year

    raise ValueError(f"Unable to resolve Nanakshahi month for {target_date.isoformat()}")


def _bengali_month_name(sun_sidereal_longitude: float) -> str:
    return MONTH_TABLES["bengali"][_solar_month_index(sun_sidereal_longitude)]["name"]


def _tamil_month_name(sun_sidereal_longitude: float) -> str:
    return MONTH_TABLES["tamil"][_solar_month_index(sun_sidereal_longitude)]["name"]


def _malayalam_month_name(sun_sidereal_longitude: float) -> str:
    return MONTH_TABLES["malayalam"][_solar_month_index(sun_sidereal_longitude)]["name"]


def _era_year(gregorian_year: int, school: str) -> int:
    if school in {"purnimanta", "gujarati"}:
        return gregorian_year + 57
    if school in {"amanta", "marathi"}:
        return gregorian_year - 78
    if school in {"tamil", "malayalam"}:
        return gregorian_year - 825
    if school == "bengali":
        return gregorian_year - 593
    raise ValueError(f"Unsupported calendar school: {school}")


def resolve_calendar_school(
    *,
    target_date: date,
    gregorian_year: int,
    school: str,
    paksha: str,
    sun_sidereal_longitude: float,
) -> CalendarSchoolResult:
    base_index = _lunar_month_index(sun_sidereal_longitude)
    if school == "purnimanta":
        month_name = _purnimanta_month_name(base_index, paksha)
        era_year = _era_year(gregorian_year, school)
        resolved_paksha = paksha
    elif school == "amanta":
        month_name = _amanta_month_name(base_index)
        era_year = _era_year(gregorian_year, school)
        resolved_paksha = paksha
    elif school == "gujarati":
        month_name = _gujarati_month_name(base_index, paksha)
        era_year = _era_year(gregorian_year, school)
        if month_name == "Kartak" and paksha == "Shukla":
            era_year += 1
        resolved_paksha = paksha
    elif school == "marathi":
        month_name = _marathi_month_name(base_index)
        era_year = _era_year(gregorian_year, school)
        resolved_paksha = paksha
    elif school == "nanakshahi":
        month_name, era_year = _nanakshahi_month_and_year(target_date)
        resolved_paksha = None
    elif school == "tamil":
        month_name = _tamil_month_name(sun_sidereal_longitude)
        era_year = _era_year(gregorian_year, school)
        resolved_paksha = None
    elif school == "malayalam":
        month_name = _malayalam_month_name(sun_sidereal_longitude)
        era_year = _era_year(gregorian_year, school)
        resolved_paksha = None
    elif school == "bengali":
        month_name = _bengali_month_name(sun_sidereal_longitude)
        era_year = _era_year(gregorian_year, school)
        resolved_paksha = paksha
    else:
        raise ValueError(f"Unsupported calendar school: {school}")

    return CalendarSchoolResult(month_name=month_name, era_year=era_year, paksha=resolved_paksha)

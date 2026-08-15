from __future__ import annotations

from datetime import date, datetime, time, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import swisseph as swe

from .calendar_schools import resolve_calendar_school
from .i18n.names import NAMES_VERSION, get_month_name_map, get_name_map
from .models import PanchangResponseModel
from .muhurta import (
    compute_abhijit_muhurta,
    compute_amrit_kala,
    compute_disha_shool,
    compute_gulika_kaal,
    compute_rahu_kaal,
    compute_yamagandam,
)
from .nakshatra import compute_nakshatra
from .rashi import compute_moon_sign
from .sunrise import compute_sunrise_sunset
from .tithi import compute_tithi_and_karana
from .transitions import compute_transitions
from .yoga import compute_yoga

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
AYANAMSA = swe.SIDM_LAHIRI
ENGINE_VERSION = "m5"

KARANA_NAME_TO_INDEX = {
    "Bava": 1,
    "Balava": 2,
    "Kaulava": 3,
    "Taitila": 4,
    "Garaja": 5,
    "Vanija": 6,
    "Vishti": 7,
    "Shakuni": 8,
    "Chatushpada": 9,
    "Naga": 10,
    "Kimstughna": 11,
}
RASHI_NAME_TO_INDEX = {
    "Mesha": 1,
    "Vrishabha": 2,
    "Mithuna": 3,
    "Karka": 4,
    "Simha": 5,
    "Kanya": 6,
    "Tula": 7,
    "Vrischika": 8,
    "Dhanu": 9,
    "Makara": 10,
    "Kumbha": 11,
    "Meena": 12,
}


def _window_with_iso(window: dict, timezone_name: str, target_date: date) -> dict:
    timezone_info = ZoneInfo(timezone_name)
    result = dict(window)
    for source, target in (("start", "start_at"), ("end", "end_at")):
        result[target] = datetime.combine(target_date, time.fromisoformat(result[source]), tzinfo=timezone_info).isoformat(timespec="seconds")
    return result


def init_swisseph(data_path: str | Path | None = None) -> None:
    path = Path(data_path) if data_path else DATA_DIR
    swe.set_ephe_path(str(path))
    swe.set_sid_mode(AYANAMSA)


def local_midnight_to_julian_day(date_iso: str, timezone_name: str) -> float:
    target_date = date.fromisoformat(date_iso)
    local_dt = datetime.combine(target_date, time.min, tzinfo=ZoneInfo(timezone_name))
    utc_dt = local_dt.astimezone(timezone.utc)
    return swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0,
        swe.GREG_CAL,
    )


def _calc_ecliptic_longitude(julian_day_ut: float, body: int, sidereal: bool = False) -> float:
    flags = swe.FLG_SWIEPH
    if sidereal:
        flags |= swe.FLG_SIDEREAL
    result, _ = swe.calc_ut(julian_day_ut, body, flags)
    return result[0] % 360.0


def compute_daily_panchang(
    *,
    date_iso: str,
    latitude: float,
    longitude: float,
    timezone_name: str,
    location_name: str,
    calendar_school: str = "purnimanta",
    lang: str = "en",
) -> dict:
    init_swisseph()
    target_date = date.fromisoformat(date_iso)
    julian_day_ut = local_midnight_to_julian_day(date_iso, timezone_name)

    sun_events = compute_sunrise_sunset(julian_day_ut, latitude, longitude, timezone_name)
    transitions = compute_transitions(target_date, sun_events["rise_dt"], timezone_name, latitude, longitude)
    for element, kind in (("tithi", "tithi"), ("nakshatra", "nakshatra"), ("yoga", "yoga")):
        if transitions[element]["next"]:
            next_item = transitions[element]["next"]
            next_item["name"] = get_name_map(kind, next_item["index"])[lang]
    if transitions["karana"]["next"]:
        next_item = transitions["karana"]["next"]
        next_item["name"] = get_name_map("karana", KARANA_NAME_TO_INDEX[next_item["name"]])[lang] if next_item["name"] in KARANA_NAME_TO_INDEX else next_item["name"]
    sunrise_dt = sun_events["rise_dt"]
    sunrise_utc = sunrise_dt.astimezone(timezone.utc)
    sunrise_jd_ut = swe.julday(
        sunrise_utc.year,
        sunrise_utc.month,
        sunrise_utc.day,
        sunrise_utc.hour + sunrise_utc.minute / 60.0 + sunrise_utc.second / 3600.0,
        swe.GREG_CAL,
    )

    sun_tropical = _calc_ecliptic_longitude(sunrise_jd_ut, swe.SUN, sidereal=False)
    moon_tropical = _calc_ecliptic_longitude(sunrise_jd_ut, swe.MOON, sidereal=False)
    sun_sidereal = _calc_ecliptic_longitude(sunrise_jd_ut, swe.SUN, sidereal=True)
    moon_sidereal = _calc_ecliptic_longitude(sunrise_jd_ut, swe.MOON, sidereal=True)

    tithi_karana = compute_tithi_and_karana(sun_tropical, moon_tropical)
    nakshatra = compute_nakshatra(moon_sidereal)
    yoga = compute_yoga(sun_sidereal, moon_sidereal)
    moon_sign = compute_moon_sign(moon_sidereal)
    paksha = "Shukla" if tithi_karana["tithi"]["index"] <= 15 else "Krishna"
    school = resolve_calendar_school(
        target_date=target_date,
        gregorian_year=target_date.year,
        school=calendar_school,
        paksha=paksha,
        sun_sidereal_longitude=sun_sidereal,
    )
    rahu_kaal = compute_rahu_kaal(sun_events["rise_dt"], sun_events["set_dt"])
    abhijit = compute_abhijit_muhurta(sun_events["rise_dt"], sun_events["set_dt"])
    yamagandam = compute_yamagandam(sun_events["rise_dt"], sun_events["set_dt"])
    gulika = compute_gulika_kaal(sun_events["rise_dt"], sun_events["set_dt"])
    amrit_kala = compute_amrit_kala(sun_events["rise_dt"], sun_events["set_dt"], yoga["index"])
    disha_shool = compute_disha_shool(sun_events["rise_dt"])

    school_month_index = next(
        index
        for index in range(1, 13)
        if get_month_name_map(calendar_school, index)["en"] == school.month_name
    )

    payload = {
        "date": date_iso,
        "location": {
            "name": location_name,
            "lat": latitude,
            "lng": longitude,
            "tz": timezone_name,
        },
        "sun": {
            "rise": sun_events["rise"],
            "set": sun_events["set"],
            "rise_at": sunrise_dt.isoformat(timespec="seconds"),
            "set_at": sun_events["set_dt"].isoformat(timespec="seconds"),
            "moonrise_at": sun_events["moonrise_dt"].isoformat(timespec="seconds") if sun_events["moonrise_dt"] else None,
            "moonset_at": sun_events["moonset_dt"].isoformat(timespec="seconds") if sun_events["moonset_dt"] else None,
        },
        "tithi": {
            "index": tithi_karana["tithi"]["index"],
            "name": get_name_map("tithi", tithi_karana["tithi"]["index"]),
            "ends_at": None,
            **transitions["tithi"],
        },
        "nakshatra": {
            **nakshatra,
            "name": get_name_map("nakshatra", nakshatra["index"]),
            **transitions["nakshatra"],
        },
        "yoga": {
            **yoga,
            "name": get_name_map("yoga", yoga["index"]),
            **transitions["yoga"],
        },
        "karana": {
            **tithi_karana["karana"],
            "name": get_name_map("karana", KARANA_NAME_TO_INDEX[tithi_karana["karana"]["name"]]),
            **transitions["karana"],
        },
        "moon_sign": get_name_map("rashi", RASHI_NAME_TO_INDEX[moon_sign]),
        "month_name": get_month_name_map(calendar_school, school_month_index),
        "era_year": school.era_year,
        "paksha": school.paksha,
        "rahu_kaal": _window_with_iso(rahu_kaal, timezone_name, target_date),
        "muhurta": {
            "abhijit": _window_with_iso(abhijit, timezone_name, target_date),
            "yamagandam": _window_with_iso(yamagandam, timezone_name, target_date),
            "gulika": _window_with_iso(gulika, timezone_name, target_date),
            "amrit_kala": _window_with_iso(amrit_kala, timezone_name, target_date),
            "disha_shool": disha_shool,
        },
        "names_version": NAMES_VERSION,
        "phase": transitions["phase"],
        "timing_metadata": transitions["timing_metadata"],
        "source": f"swiss-ephemeris:{ENGINE_VERSION}",
    }
    return PanchangResponseModel.model_validate(payload).model_dump()

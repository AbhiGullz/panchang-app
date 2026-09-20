from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from math import cos, pi
from typing import Callable
from zoneinfo import ZoneInfo

import swisseph as swe

from .nakshatra import NAKSHATRA_NAMES
from .rashi import RASHI_NAMES
from .tithi import KARANA_SEQUENCE, SPECIAL_KARANAS, TITHI_NAMES
from .yoga import YOGA_NAMES

_STEP_MINUTES = 10


def _jd(dt: datetime) -> float:
    utc = dt.astimezone(timezone.utc)
    return swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600, swe.GREG_CAL)


def _iso(dt: datetime | None) -> str | None:
    return dt.isoformat(timespec="seconds") if dt else None


def _sidereal_longitude(jd: float, body: int) -> float:
    values, _ = swe.calc_ut(jd, body, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
    return values[0] % 360


def _tropical_longitude(jd: float, body: int) -> float:
    values, _ = swe.calc_ut(jd, body, swe.FLG_SWIEPH)
    return values[0] % 360


def _phase(jd: float) -> float:
    return (_tropical_longitude(jd, swe.MOON) - _tropical_longitude(jd, swe.SUN)) % 360


def next_phase_boundary(center: datetime, target_degrees: float) -> datetime:
    """Return the next local instant at which lunar elongation reaches a target."""
    start_phase = _phase(_jd(center))
    advance = (target_degrees - start_phase) % 360
    if advance < 0.001:
        advance = 360.0

    def progressed(at: datetime) -> float:
        return (_phase(_jd(at)) - start_phase) % 360

    left = center
    right = center + timedelta(days=(advance / 10.5) + 2)
    while progressed(right) < advance:
        right += timedelta(days=1)
    for _ in range(36):
        middle = left + (right - left) / 2
        if progressed(middle) < advance:
            left = middle
        else:
            right = middle
    return right


def _bucket(value: float, span: float, count: int) -> int:
    return min(count - 1, int((value % 360) // span))


def _karana_bucket(phase: float) -> int:
    return min(59, int(phase // 6))


def _karana_name(slot: int) -> str:
    return SPECIAL_KARANAS.get(slot, KARANA_SEQUENCE[(slot - 1) % len(KARANA_SEQUENCE)])


def _find_boundary(left: datetime, right: datetime, fn: Callable[[datetime], int]) -> datetime:
    left_bucket = fn(left)
    for _ in range(32):
        middle = left + (right - left) / 2
        if fn(middle) == left_bucket:
            left = middle
        else:
            right = middle
    return right


def _boundaries(center: datetime, fn: Callable[[datetime], int], radius_days: int = 3) -> list[datetime]:
    start = center - timedelta(days=radius_days)
    end = center + timedelta(days=radius_days)
    cursor = start
    previous = fn(cursor)
    found: list[datetime] = []
    while cursor < end:
        next_cursor = min(cursor + timedelta(minutes=_STEP_MINUTES), end)
        current = fn(next_cursor)
        if current != previous:
            found.append(_find_boundary(cursor, next_cursor, fn))
            previous = current
        cursor = next_cursor
    return found


def _element_transition(
    center: datetime,
    fn: Callable[[datetime], int],
    names: list[str],
    current_index: int,
) -> dict:
    changes = _boundaries(center, fn)
    previous = max((item for item in changes if item <= center), default=None)
    following = min((item for item in changes if item > center), default=None)
    return {
        "start": _iso(previous),
        "end": _iso(following),
        "next": {"index": (current_index + 1) % len(names) + 1, "name": names[(current_index + 1) % len(names)], "at": _iso(following)} if following else None,
    }


def compute_transitions(target_date: date, sunrise_dt: datetime, timezone_name: str, latitude: float, longitude: float) -> dict:
    tz = ZoneInfo(timezone_name)
    local_start = datetime.combine(target_date, time.min, tzinfo=tz)
    local_end = local_start + timedelta(days=1)
    phase = _phase(_jd(sunrise_dt))
    tithi_index = _bucket(phase, 12, 30)
    nak_value = _sidereal_longitude(_jd(sunrise_dt), swe.MOON)
    nak_index = _bucket(nak_value, 360 / 27, 27)
    yoga_value = (_sidereal_longitude(_jd(sunrise_dt), swe.SUN) + nak_value) % 360
    yoga_index = _bucket(yoga_value, 360 / 27, 27)
    karana_slot = _karana_bucket(phase)
    rashi_index = _bucket(nak_value, 30, 12)

    tithi = _element_transition(sunrise_dt, lambda dt: _bucket(_phase(_jd(dt)), 12, 30), TITHI_NAMES, tithi_index)
    nakshatra = _element_transition(sunrise_dt, lambda dt: _bucket(_sidereal_longitude(_jd(dt), swe.MOON), 360 / 27, 27), NAKSHATRA_NAMES, nak_index)
    yoga = _element_transition(
        sunrise_dt,
        lambda dt: _bucket((_sidereal_longitude(_jd(dt), swe.SUN) + _sidereal_longitude(_jd(dt), swe.MOON)) % 360, 360 / 27, 27),
        YOGA_NAMES,
        yoga_index,
    )
    karana_changes = _boundaries(sunrise_dt, lambda dt: _karana_bucket(_phase(_jd(dt))))
    rashi = _element_transition(sunrise_dt, lambda dt: _bucket(_sidereal_longitude(_jd(dt), swe.MOON), 30, 12), RASHI_NAMES, rashi_index)
    in_day = [item for item in karana_changes if local_start <= item < local_end]
    karana_transitions = [{"at": _iso(item), "index": _karana_bucket(_phase(_jd(item))) + 1, "name": _karana_name(_karana_bucket(_phase(_jd(item))))} for item in in_day]
    next_karana_at = min((item for item in karana_changes if item > sunrise_dt), default=None)
    next_slot = _karana_bucket(_phase(_jd(next_karana_at))) if next_karana_at else (karana_slot + 1) % 60

    # Fraction of the lunar disc illuminated: 0 at conjunction, 0.5 at a
    # quarter, and 1 at opposition. Phase progress is retained separately as
    # elongation_degrees.
    illumination = (1 - cos(phase * pi / 180)) / 2
    phase_state = int(round(phase / 12)) % 30
    return {
        "tithi": {"start": tithi["start"], "end": tithi["end"], "next": {"index": (tithi_index + 1) % 30 + 1, "name": TITHI_NAMES[(tithi_index + 1) % 30], "at": tithi["next"]["at"] if tithi["next"] else None}},
        "nakshatra": {"start": nakshatra["start"], "end": nakshatra["end"], "next": {"index": (nak_index + 1) % 27 + 1, "name": NAKSHATRA_NAMES[(nak_index + 1) % 27], "at": nakshatra["next"]["at"] if nakshatra["next"] else None}},
        "yoga": {"start": yoga["start"], "end": yoga["end"], "next": {"index": (yoga_index + 1) % 27 + 1, "name": YOGA_NAMES[(yoga_index + 1) % 27], "at": yoga["next"]["at"] if yoga["next"] else None}},
        "karana": {"start": _iso(max((item for item in karana_changes if item <= sunrise_dt), default=None)), "end": _iso(next_karana_at), "next": {"index": next_slot + 1, "name": _karana_name(next_slot), "at": _iso(next_karana_at)}, "transitions": karana_transitions},
        "moon_sign": {"start": rashi["start"], "end": rashi["end"], "next": {"index": (rashi_index + 1) % 12 + 1, "name": RASHI_NAMES[(rashi_index + 1) % 12], "at": rashi["next"]["at"] if rashi["next"] else None}},
        "phase": {"state": phase_state, "elongation_degrees": round(phase, 6), "illumination": round(illumination, 6), "label": TITHI_NAMES[tithi_index]},
        "timing_metadata": {"timezone": timezone_name, "ayanamsa": "Lahiri", "calculation": "Swiss Ephemeris with deterministic 10-minute bracket and bisection root search"},
    }

"""Personal lunar recurrences. Names and notes remain in the browser."""
from datetime import date, datetime, time, timedelta
from functools import lru_cache
from zoneinfo import ZoneInfo

import swisseph as swe

from .core import init_swisseph
from .observances import _month
from .transitions import _jd


def lunar_rule(day: date, lat: float, lng: float, tz: str, school: str) -> dict:
    init_swisseph()
    jd = _jd(datetime.combine(day, time.min, ZoneInfo(tz)))
    status, event = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE, (lng, lat, 0), flags=swe.FLG_SWIEPH)
    if status != 0:
        raise ValueError('Sunrise unavailable at this location')
    point = event[0]
    phase = (swe.calc_ut(point, swe.MOON)[0][0] - swe.calc_ut(point, swe.SUN)[0][0]) % 360
    tithi = int(phase // 12) + 1
    month, adhika = _month(point)
    if school == 'purnimanta' and tithi > 15:
        month = month % 12 + 1
    return {'month': month, 'tithi': tithi, 'adhika': adhika, 'calendar': school}


@lru_cache(maxsize=32)
def year_rules(year: int, lat: float, lng: float, tz: str, school: str) -> tuple:
    rows = []
    day = date(year, 1, 1)
    while day.year == year:
        try:
            rows.append((day.isoformat(), lunar_rule(day, lat, lng, tz, school)))
        except ValueError:
            pass
        day += timedelta(days=1)
    return tuple(rows)


def recurrence_dates(year: int, month: int, tithi: int, adhika: bool, lat: float, lng: float, tz: str, school: str) -> list[str]:
    dates = []
    previous = None
    for day, rule in year_rules(year, lat, lng, tz, school):
        if rule['month'] == month and rule['tithi'] == tithi and rule['adhika'] == adhika:
            # First sunrise when a tithi repeats. A skipped sunrise is omitted.
            current = date.fromisoformat(day)
            if previous is None or (current - previous).days > 1:
                dates.append(day)
            previous = current
    return dates

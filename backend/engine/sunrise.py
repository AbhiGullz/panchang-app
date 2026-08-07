from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import swisseph as swe


def to_local_datetime(julian_day_ut: float, timezone_name: str) -> datetime:
    year, month, day, hour = swe.revjul(julian_day_ut, swe.GREG_CAL)
    hour_int = int(hour)
    minute_float = (hour - hour_int) * 60.0
    minute = int(minute_float)
    second = int(round((minute_float - minute) * 60.0))
    if second == 60:
        second = 0
        minute += 1
    if minute == 60:
        minute = 0
        hour_int += 1
    dt_utc = datetime(year, month, day, tzinfo=timezone.utc) + timedelta(
        hours=hour_int, minutes=minute, seconds=second
    )
    return dt_utc.astimezone(ZoneInfo(timezone_name))


def compute_sunrise_sunset(julian_day_ut: float, latitude: float, longitude: float, timezone_name: str) -> dict:
    geopos = (longitude, latitude, 0.0)
    rise_result, rise_time = swe.rise_trans(
        julian_day_ut,
        swe.SUN,
        swe.CALC_RISE,
        geopos,
        atpress=1013.25,
        attemp=15.0,
        flags=swe.FLG_SWIEPH,
    )
    set_result, set_time = swe.rise_trans(
        julian_day_ut,
        swe.SUN,
        swe.CALC_SET,
        geopos,
        atpress=1013.25,
        attemp=15.0,
        flags=swe.FLG_SWIEPH,
    )
    if rise_result != 0 or set_result != 0:
        raise RuntimeError("Swiss Ephemeris failed to compute sunrise/sunset")
    rise_dt = to_local_datetime(rise_time[0], timezone_name)
    set_dt = to_local_datetime(set_time[0], timezone_name)
    return {"rise_dt": rise_dt, "set_dt": set_dt, "rise": rise_dt.strftime("%H:%M"), "set": set_dt.strftime("%H:%M")}

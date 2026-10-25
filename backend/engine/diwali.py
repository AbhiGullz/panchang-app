"""Diwali observances from exact tithi intervals and local ritual windows.

These are reproducible general observance selections, not personalized lagnas.
When no ritual window overlaps, use the civil day containing most of the tithi
and expose that fallback rather than returning an undated festival.
"""
from datetime import datetime, time, timedelta
from functools import lru_cache
from zoneinfo import ZoneInfo

import swisseph as swe

from .observances import _month, LANGUAGES
from .sunrise import to_local_datetime
from .transitions import next_phase_boundary, _jd

NAMES = {
    'dhanteras': ['Dhanteras', 'धनतेरस', 'धनत्रयोदशी', 'தனத்திரயோதசி', 'ధన త్రయోదశి', 'ಧನತ್ರಯೋದಶಿ', 'ധനത്രയോദശി', 'ધનતેરસ', 'ধনতেরাস', 'ਧਨਤੇਰਸ'],
    'naraka': ['Narak Chaturdashi', 'नरक चतुर्दशी', 'नरक चतुर्दशी', 'நரக சதுர்த்தசி', 'నరక చతుర్దశి', 'ನರಕ ಚತುರ್ದಶಿ', 'നരക ചതുർദശി', 'નરક ચતુર્દશી', 'নরক চতুর্দশী', 'ਨਰਕ ਚਤੁਰਦਸ਼ੀ'],
    'diwali': ['Diwali', 'दीपावली', 'दिवाळी', 'தீபாவளி', 'దీపావళి', 'ದೀಪಾವಳಿ', 'ദീപാവലി', 'દિવાળી', 'দীপাবলি', 'ਦੀਵਾਲੀ'],
    'govardhan': ['Govardhan Puja / Bali Pratipada', 'गोवर्धन पूजा / बलि प्रतिपदा', 'गोवर्धन पूजा / बलिप्रतिपदा', 'கோவர்த்தன பூஜை / பலி பிரதமை', 'గోవర్ధన పూజ / బలి పాడ్యమి', 'ಗೋವರ್ಧನ ಪೂಜೆ / ಬಲಿಪಾಡ್ಯಮಿ', 'ഗോവർധന പൂജ / ബലിപ്രതിപദ', 'ગોવર્ધન પૂજા / બલિ પ્રતિપદા', 'গোবর্ধন পূজা / বলি প্রতিপদ', 'ਗੋਵਰਧਨ ਪੂਜਾ / ਬਲੀ ਪ੍ਰਤਿਪਦਾ'],
    'bhai-dooj': ['Bhai Dooj', 'भाई दूज', 'भाऊबीज', 'பாய் தூஜ்', 'భగినీ హస్త భోజనం', 'ಭಾಯಿ ದೂಜ್', 'ഭായ് ദൂജ്', 'ભાઈબીજ', 'ভাইফোঁটা', 'ਭਾਈ ਦੂਜ'],
}
SOURCES = {
    'dhanteras': 'https://www.mypanchang.com/newsite/dhanteras.php',
    'naraka': 'https://www.drikpanchang.com/festivals/narak-chaturdashi/narak-chaturdashi-date-time.html',
    'diwali': 'https://www.drikpanchang.com/festivals/diwali/diwali-lakshmipuja-timings.html',
    'govardhan': 'https://www.drikpanchang.com/festivals/govardhan-puja/puja-vidhi/govardhan-puja-vidhi.html',
    'bhai-dooj': 'https://www.drikpanchang.com/festivals/bhai-dooj/bhai-dooj-date-time.html',
}


def overlap(a, b, c, d):
    # UTC timestamps avoid wall-clock subtraction across DST transitions.
    return max(0, min(b.timestamp(), d.timestamp()) - max(a.timestamp(), c.timestamp()))


def solar_event(day, lat, lng, tz, event):
    jd = _jd(datetime.combine(day, time.min, ZoneInfo(tz)))
    status, result = swe.rise_trans(jd, swe.SUN, event, (lng, lat, 0), flags=swe.FLG_SWIEPH)
    if status != 0:
        return None
    dt = to_local_datetime(result[0], tz)
    return dt if dt.date() == day else None


def ritual_window(day, kind, lat, lng, tz):
    rise = solar_event(day, lat, lng, tz, swe.CALC_RISE)
    setting = solar_event(day, lat, lng, tz, swe.CALC_SET)
    if not rise or not setting:
        return None
    daylight = setting - rise
    if kind == 'arunodaya':
        return rise - timedelta(minutes=96), rise
    if kind == 'pratah':
        return rise, rise + daylight / 5
    if kind == 'aparahna':
        return rise + daylight * 3 / 5, rise + daylight * 4 / 5
    next_rise = solar_event(day + timedelta(days=1), lat, lng, tz, swe.CALC_RISE)
    if next_rise:
        return setting, setting + (next_rise - setting) / 5
    return None


def select_day(start, end, kind, lat, lng, tz):
    candidates = []
    day = start.date() - timedelta(days=1)
    while day <= end.date() + timedelta(days=1):
        window = ritual_window(day, kind, lat, lng, tz)
        amount = overlap(start, end, *window) if window else 0
        midnight = datetime.combine(day, time.min, ZoneInfo(tz))
        civil_overlap = overlap(start, end, midnight, midnight + timedelta(days=1))
        candidates.append((day, amount, civil_overlap, window))
        day += timedelta(days=1)
    matching = [row for row in candidates if row[1] > 0]
    if matching:
        # Greatest ritual overlap; later civil date breaks an exact tie.
        chosen = max(matching, key=lambda row: (row[1], row[0]))
        return chosen, 'ritual-window-overlap', len(matching) > 1
    return max(candidates, key=lambda row: (row[2], row[0])), 'civil-day-fallback', True


@lru_cache(maxsize=64)
def diwali_observances(year, lat, lng, tz, lang):
    zone = ZoneInfo(tz)
    cursor = datetime(year, 1, 1, tzinfo=zone)
    result = []
    # Locate the regular Ashwin-ending new moon. Never reuse fixed dates or
    # assume that consecutive festivals occupy consecutive Gregorian days.
    for _ in range(14):
        new_moon = next_phase_boundary(cursor, 0)
        if new_moon.year > year:
            break
        month, adhika = _month(_jd(new_moon - timedelta(hours=1)))
        if month == 7 and not adhika:
            boundaries = [next_phase_boundary(new_moon - timedelta(days=7), phase) for phase in (324, 336, 348)]
            boundaries += [new_moon, next_phase_boundary(new_moon + timedelta(hours=1), 12), next_phase_boundary(new_moon + timedelta(hours=1), 24)]
            for index, (key, kind) in enumerate([('dhanteras', 'pradosha'), ('naraka', 'arunodaya'), ('diwali', 'pradosha'), ('govardhan', 'pratah'), ('bhai-dooj', 'aparahna')]):
                start, end = boundaries[index:index + 2]
                chosen, basis, ambiguous = select_day(start, end, kind, lat, lng, tz)
                day, _, _, window = chosen
                result.append({
                    'id': key, 'name': NAMES[key][0], 'localized_name': NAMES[key][LANGUAGES.index(lang)],
                    'date': day.isoformat(), 'region': 'pan-India', 'source': SOURCES[key],
                    'calculation_basis': basis, 'ritual_window': kind,
                    'selection_note': 'regional-variation' if ambiguous or key == 'govardhan' else 'local-window',
                    'alternative_dates': [candidate.isoformat() for candidate in (start.date(), end.date()) if candidate != day],
                    'tithi_start': start.isoformat(), 'tithi_end': end.isoformat(),
                    'observance_start': max(start, window[0]).isoformat() if window and basis != 'civil-day-fallback' else None,
                    'observance_end': min(end, window[1]).isoformat() if window and basis != 'civil-day-fallback' else None,
                })
        cursor = new_moon + timedelta(days=1)
    return tuple(result)

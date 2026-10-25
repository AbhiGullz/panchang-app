from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from engine.core import init_swisseph
from engine.diwali import diwali_observances, select_day, NAMES
from engine.festivals import compute_festivals_for_year


@pytest.mark.parametrize('year,expected', [
    (2024, ['10-29', '10-31', '10-31', '11-02', '11-03']),
    (2025, ['10-18', '10-20', '10-20', '10-22', '10-23']),
    (2026, ['11-06', '11-08', '11-08', '11-10', '11-11']),
    (2027, ['10-27', '10-28', '10-29', '10-30', '10-31']),
])
def test_delhi_diwali_sequence(year, expected):
    # Published Drik Panchang Diwali calendars; 2027 Diwali also BAPS calendar.
    init_swisseph()
    rows = diwali_observances(year, 28.6139, 77.209, 'Asia/Kolkata', 'en')
    assert [row['date'] for row in rows] == [f'{year}-{day}' for day in expected]
    assert [row['id'] for row in rows] == ['dhanteras', 'naraka', 'diwali', 'govardhan', 'bhai-dooj']
    for row in rows:
        assert row['date'] != 'unverified'
        if row['observance_start']:
            assert datetime.fromisoformat(row['tithi_start']) <= datetime.fromisoformat(row['observance_start']) < datetime.fromisoformat(row['observance_end']) <= datetime.fromisoformat(row['tithi_end'])


def test_new_jersey_and_language_independence():
    # https://www.drikpanchang.com/diwali/diwali-puja-calendar.html?geoname-id=5128581
    init_swisseph()
    english = diwali_observances(2026, 40.51, -74.86, 'America/New_York', 'en')
    assert [row['date'] for row in english] == ['2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10']
    hindi = diwali_observances(2026, 40.51, -74.86, 'America/New_York', 'hi')
    assert [row['date'] for row in hindi] == [row['date'] for row in english]
    assert hindi[0]['localized_name'] == 'धनतेरस'
    assert all(len(names) == 10 for names in NAMES.values())


def test_polar_or_missing_ritual_window_uses_explicit_fallback(monkeypatch):
    monkeypatch.setattr('engine.diwali.ritual_window', lambda *args: None)
    start = datetime(2026, 11, 8, 8, tzinfo=ZoneInfo('UTC'))
    end = datetime(2026, 11, 9, 12, tzinfo=ZoneInfo('UTC'))
    chosen, basis, ambiguous = select_day(start, end, 'pradosha', 89, 0, 'UTC')
    assert chosen[0].isoformat() == '2026-11-08'
    assert basis == 'civil-day-fallback'
    assert ambiguous


def test_annual_calendar_replaces_legacy_diwali_once():
    rows = compute_festivals_for_year(2026, lang='mr')
    assert len([row for row in rows if row['name'] == 'Diwali']) == 1
    assert {row.get('id') for row in rows} >= {'dhanteras', 'naraka', 'diwali', 'govardhan', 'bhai-dooj'}

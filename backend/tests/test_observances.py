"""Regression dates cross-checked against published 2026 calendars.

Kojagiri: IMD Rashtriya Panchanga festival table (2026).
Prakat Din: gajanannj.org 2026 temple event.
Yogini: Drik Panchang 2026 Yogini calendar (Maharashtra).
"""
from engine.core import init_swisseph
from engine.observances import NAMES, LANGUAGES, regional_observances
from fastapi.testclient import TestClient
from api.main import app


def test_named_observance_dates_and_short_tithi():
    init_swisseph()
    events = {item['id']: item for item in regional_observances(2026, 18.5204, 73.8567, 'Asia/Kolkata', 'en')}
    assert events['kojagiri']['date'] == '2026-10-25'
    assert events['kojagiri']['calculation_basis'] == 'midnight'
    assert events['gajanan-prakat']['date'] == '2026-02-08'
    assert events['yogini']['date'] == '2026-07-10'
    assert events['yogini']['calculation_basis'] == 'daytime-tithi-reminder'
    assert events['utthana']['date'] == '2026-11-20'
    assert events['gajanan-punyatithi']['date'] == events['rishi']['date']


def test_every_new_observance_has_all_language_names():
    for translations in NAMES.values():
        assert len(translations) == len(LANGUAGES)
        assert all(translations)
        for name in translations[1:]:
            assert not any('A' <= char <= 'z' for char in name)


def test_language_does_not_change_dates_or_regions():
    init_swisseph()
    english = regional_observances(2026, 18.5204, 73.8567, 'Asia/Kolkata', 'en')
    for lang in LANGUAGES[1:]:
        localized = regional_observances(2026, 18.5204, 73.8567, 'Asia/Kolkata', lang)
        assert [(x['id'], x['date'], x['region']) for x in localized] == [(x['id'], x['date'], x['region']) for x in english]


def test_festival_endpoint_validates_location_and_timezone():
    client = TestClient(app)
    assert client.get('/api/v1/festivals', params={'year': 2026, 'tz': 'bad/timezone'}).status_code == 400
    assert client.get('/api/v1/festivals', params={'year': 2026, 'lat': 91}).status_code == 422
    response = client.get('/api/v1/festivals', params={'year': 2026, 'lat': 40.51, 'lng': -74.86, 'tz': 'America/New_York', 'lang': 'mr'})
    assert response.status_code == 200
    assert any(x.get('id') == 'kojagiri' and x['localized_name'] == 'कोजागिरी पौर्णिमा' for x in response.json()['festivals'])

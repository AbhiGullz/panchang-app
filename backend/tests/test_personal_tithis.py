from datetime import date

from fastapi.testclient import TestClient
from api.main import app
from engine.personal_tithis import lunar_rule, recurrence_dates


def test_reference_date_captures_school_and_future_recurrence():
    args = (18.5204, 73.8567, 'Asia/Kolkata')
    amanta = lunar_rule(date(2026, 10, 28), *args, 'amanta')
    purnimanta = lunar_rule(date(2026, 10, 28), *args, 'purnimanta')
    assert amanta['tithi'] == purnimanta['tithi'] == 18
    assert amanta['month'] == 7
    assert purnimanta['month'] == 8
    dates = recurrence_dates(2027, amanta['month'], amanta['tithi'], amanta['adhika'], *args, 'amanta')
    assert dates
    for day in dates:
        assert lunar_rule(date.fromisoformat(day), *args, 'amanta') == amanta
    assert dates == recurrence_dates(2027, purnimanta['month'], purnimanta['tithi'], purnimanta['adhika'], *args, 'purnimanta')


def test_api_preview_saved_rule_and_validation():
    client = TestClient(app)
    params = {'date': '2026-10-28', 'year': 2027, 'calendar': 'amanta', 'lat': 18.5204, 'lng': 73.8567, 'tz': 'Asia/Kolkata'}
    result = client.get('/api/v1/personal-tithi', params=params)
    assert result.status_code == 200
    assert result.json()['rule']['tithi'] == 18
    assert 'mr' in result.json()['month_names']
    override = client.get('/api/v1/personal-tithi', params={**params, 'month': 7, 'tithi': 15, 'adhika': False})
    assert override.json()['rule']['tithi'] == 15
    assert client.get('/api/v1/personal-tithi', params={**params, 'calendar': 'tamil'}).status_code == 400
    assert client.get('/api/v1/personal-tithi', params={**params, 'date': 'invalid'}).status_code == 400
    assert client.get('/api/v1/personal-tithi', params={**params, 'tz': 'invalid'}).status_code == 400
    assert client.get('/api/v1/personal-tithi', params={**params, 'tithi': 31}).status_code == 422

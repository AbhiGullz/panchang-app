from engine.core import compute_daily_panchang


def test_purnimanta_and_amanta_are_stable_during_krishna_paksha():
    purnimanta = compute_daily_panchang(
        date_iso="2027-10-20",
        latitude=28.6139,
        longitude=77.2090,
        timezone_name="Asia/Kolkata",
        location_name="Delhi",
        calendar_school="purnimanta",
    )
    amanta = compute_daily_panchang(
        date_iso="2027-10-20",
        latitude=28.6139,
        longitude=77.2090,
        timezone_name="Asia/Kolkata",
        location_name="Delhi",
        calendar_school="amanta",
    )
    assert purnimanta["paksha"] == "Krishna"
    assert amanta["paksha"] == "Krishna"
    assert purnimanta["month_name"]["en"] == amanta["month_name"]["en"]


def test_purnimanta_2026_bhadrapada_purnima_rolls_to_ashwin():
    location = {
        "latitude": 40.3573,
        "longitude": -74.6672,
        "timezone_name": "America/New_York",
        "location_name": "Flemington",
        "calendar_school": "purnimanta",
    }
    purnima = compute_daily_panchang(date_iso="2026-09-26", **location)
    next_day = compute_daily_panchang(date_iso="2026-09-27", **location)

    assert purnima["month_name"]["en"] == "Bhadrapada"
    assert purnima["tithi"]["name"]["en"] == "Purnima"
    assert next_day["month_name"]["en"] == "Ashwin"
    assert next_day["tithi"]["name"]["en"] == "Krishna Pratipada"


def test_tamil_calendar_uses_solar_month_names():
    tamil = compute_daily_panchang(
        date_iso="2027-04-16",
        latitude=13.0827,
        longitude=80.2707,
        timezone_name="Asia/Kolkata",
        location_name="Chennai",
        calendar_school="tamil",
    )
    assert tamil["month_name"]["en"] == "Chithirai"


def test_era_years_are_consistent_for_2026():
    assert compute_daily_panchang(
        date_iso="2026-08-03",
        latitude=28.6139,
        longitude=77.2090,
        timezone_name="Asia/Kolkata",
        location_name="Delhi",
        calendar_school="purnimanta",
    )["era_year"] == 2083
    assert compute_daily_panchang(
        date_iso="2026-08-03",
        latitude=28.6139,
        longitude=77.2090,
        timezone_name="Asia/Kolkata",
        location_name="Delhi",
        calendar_school="amanta",
    )["era_year"] == 1948
    assert compute_daily_panchang(
        date_iso="2026-08-03",
        latitude=28.6139,
        longitude=77.2090,
        timezone_name="Asia/Kolkata",
        location_name="Delhi",
        calendar_school="tamil",
    )["era_year"] == 1201
    assert compute_daily_panchang(
        date_iso="2026-08-03",
        latitude=28.6139,
        longitude=77.2090,
        timezone_name="Asia/Kolkata",
        location_name="Delhi",
        calendar_school="malayalam",
    )["era_year"] == 1201
    assert compute_daily_panchang(
        date_iso="2026-08-03",
        latitude=28.6139,
        longitude=77.2090,
        timezone_name="Asia/Kolkata",
        location_name="Delhi",
        calendar_school="bengali",
    )["era_year"] == 1433

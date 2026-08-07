from engine.core import compute_daily_panchang


DELHI = {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone_name": "Asia/Kolkata",
    "location_name": "Delhi",
}

AHMEDABAD = {
    "latitude": 23.0225,
    "longitude": 72.5714,
    "timezone_name": "Asia/Kolkata",
    "location_name": "Ahmedabad",
}

AMRITSAR = {
    "latitude": 31.6340,
    "longitude": 74.8723,
    "timezone_name": "Asia/Kolkata",
    "location_name": "Amritsar",
}


def _panchang(date_iso: str, calendar_school: str, location: dict) -> dict:
    return compute_daily_panchang(
        date_iso=date_iso,
        calendar_school=calendar_school,
        **location,
    )


def test_gujarati_new_year_is_day_after_diwali():
    diwali = _panchang("2026-11-09", "gujarati", AHMEDABAD)
    new_year = _panchang("2026-11-10", "gujarati", AHMEDABAD)

    assert diwali["tithi"]["index"] == 30
    assert diwali["paksha"] == "Krishna"
    assert diwali["month_name"]["en"] == "Aso"

    assert new_year["tithi"]["index"] == 1
    assert new_year["paksha"] == "Shukla"
    assert new_year["month_name"]["en"] == "Kartak"
    assert new_year["era_year"] == diwali["era_year"] + 1


def test_gujarati_month_reckoning_is_amanta_style_with_gujarati_names():
    gujarati = _panchang("2027-10-24", "gujarati", AHMEDABAD)
    amanta = _panchang("2027-10-24", "amanta", AHMEDABAD)
    purnimanta = _panchang("2027-10-24", "purnimanta", AHMEDABAD)

    assert gujarati["paksha"] == amanta["paksha"] == "Krishna"
    assert amanta["month_name"]["en"] == "Kartika"
    assert gujarati["month_name"]["en"] == "Aso"
    assert gujarati["month_name"]["en"] != purnimanta["month_name"]["en"]


def test_marathi_new_year_is_gudi_padwa_and_uses_shaka_era():
    marathi = _panchang("2027-03-22", "marathi", DELHI)
    amanta = _panchang("2027-03-22", "amanta", DELHI)

    assert marathi["tithi"]["index"] == 15
    assert marathi["paksha"] == "Shukla"
    assert marathi["month_name"]["en"] == "Chaitra"
    assert marathi["era_year"] == 1949
    assert amanta["tithi"]["index"] == marathi["tithi"]["index"]
    assert amanta["paksha"] == marathi["paksha"]


def test_nanakshahi_chet_starts_on_14_march_every_year():
    for date_iso, expected_year in [
        ("2025-03-14", 556),
        ("2026-03-14", 557),
        ("2027-03-14", 558),
    ]:
        result = _panchang(date_iso, "nanakshahi", AMRITSAR)
        assert result["month_name"]["en"] == "Chet"
        assert result["era_year"] == expected_year
        assert result["paksha"] is None


def test_nanakshahi_month_names_follow_fixed_solar_boundaries():
    chet = _panchang("2026-04-13", "nanakshahi", AMRITSAR)
    vaisakh = _panchang("2026-04-14", "nanakshahi", AMRITSAR)

    assert chet["month_name"]["en"] == "Chet"
    assert vaisakh["month_name"]["en"] == "Vaisakh"
    assert chet["era_year"] == vaisakh["era_year"] == 557
    assert chet["paksha"] is None
    assert vaisakh["paksha"] is None

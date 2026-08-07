from fastapi.testclient import TestClient

from api.main import app
from engine.i18n.names import (
    LANGUAGES,
    NAKSHATRA_NAMES,
    NAMES_VERSION,
    RASHI_NAMES,
    TITHI_NAMES,
    VERIFIED_LANGUAGES,
    YOGA_NAMES,
    get_all_names,
    get_lang_names,
    get_month_name,
    get_term_name,
)

client = TestClient(app)


def test_i18n_tables_are_complete_for_all_languages():
    for lang in LANGUAGES:
        assert len(TITHI_NAMES[lang]) == 30
        assert len(NAKSHATRA_NAMES[lang]) == 27
        assert len(YOGA_NAMES[lang]) == 27
        assert len(RASHI_NAMES[lang]) == 12
        assert len(get_all_names("karana", lang)) == 11
        for school in [
            "purnimanta",
            "amanta",
            "gujarati",
            "marathi",
            "nanakshahi",
            "tamil",
            "malayalam",
            "bengali",
        ]:
            months = [get_month_name(school, index, lang) for index in range(1, 13)]
            assert len(months) == 12
            assert all(months)


def test_verified_core_languages_are_true():
    for lang in ["en", "hi", "ta", "te"]:
        assert VERIFIED_LANGUAGES[lang] is True


def test_spot_checks_match_expected_translations():
    assert get_term_name("tithi", 1, "hi") == "शुक्ल प्रतिपदा"
    assert get_term_name("tithi", 1, "ta") == "சுக்ல பிரதமை"
    assert get_term_name("nakshatra", 1, "te") == "అశ్విని"


def test_api_returns_localized_names_and_names_version():
    response = client.get(
        "/api/v1/panchang",
        params={
            "date": "2026-08-03",
            "lat": 28.6139,
            "lng": 77.2090,
            "tz": "Asia/Kolkata",
            "lang": "hi",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["names_version"] == NAMES_VERSION
    assert body["tithi"]["name"]["en"]
    assert body["tithi"]["name"]["hi"]
    assert body["nakshatra"]["name"]["ta"]
    assert body["lang_names"]["tithi"] == body["tithi"]["name"]["hi"]
    assert body["lang_names"]["month_name"] == body["month_name"]["hi"]

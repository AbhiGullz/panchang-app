from engine.core import compute_daily_panchang


def _summary(panchang: dict) -> str:
    return (
        f"{panchang['location']['name']} ({panchang['date']})\n"
        f"  Sunrise: {panchang['sun']['rise']}\n"
        f"  Sunset: {panchang['sun']['set']}\n"
        f"  Tithi: {panchang['tithi']['name']} [{panchang['tithi']['index']}]\n"
        f"  Nakshatra: {panchang['nakshatra']['name']} (Pada {panchang['nakshatra']['pada']})\n"
        f"  Yoga: {panchang['yoga']['name']}\n"
        f"  Karana: {panchang['karana']['name']}\n"
        f"  Moon Sign: {panchang['moon_sign']}\n"
        f"  Rahu Kaal: {panchang['rahu_kaal']['start']} - {panchang['rahu_kaal']['end']}"
    )


def test_engine_smoke_delhi_and_london(capsys):
    scenarios = [
        ("Delhi", 28.6139, 77.2090, "Asia/Kolkata", "2026-08-03"),
        ("London", 51.5074, -0.1278, "Europe/London", "2026-08-03"),
    ]

    results = []
    for name, lat, lng, tz, date in scenarios:
        results.append(
            compute_daily_panchang(
                date_iso=date,
                latitude=lat,
                longitude=lng,
                timezone_name=tz,
                location_name=name,
            )
        )

    summary = "\n\n".join(_summary(result) for result in results)
    print(summary)
    captured = capsys.readouterr()
    assert summary in captured.out

    assert len(results) == 2
    assert "Delhi" in captured.out
    assert "London" in captured.out
    for result in results:
        assert result["sun"]["rise"]
        assert result["sun"]["set"]
        assert result["tithi"]["name"]
        assert result["nakshatra"]["name"]
        assert result["yoga"]["name"]
        assert result["karana"]["name"]
        assert result["moon_sign"]
        assert result["rahu_kaal"]["start"]
        assert result["rahu_kaal"]["end"]

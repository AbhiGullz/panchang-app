TITHI_NAMES = [
    "Shukla Pratipada",
    "Shukla Dwitiya",
    "Shukla Tritiya",
    "Shukla Chaturthi",
    "Shukla Panchami",
    "Shukla Shashthi",
    "Shukla Saptami",
    "Shukla Ashtami",
    "Shukla Navami",
    "Shukla Dashami",
    "Shukla Ekadashi",
    "Shukla Dwadashi",
    "Shukla Trayodashi",
    "Shukla Chaturdashi",
    "Purnima",
    "Krishna Pratipada",
    "Krishna Dwitiya",
    "Krishna Tritiya",
    "Krishna Chaturthi",
    "Krishna Panchami",
    "Krishna Shashthi",
    "Krishna Saptami",
    "Krishna Ashtami",
    "Krishna Navami",
    "Krishna Dashami",
    "Krishna Ekadashi",
    "Krishna Dwadashi",
    "Krishna Trayodashi",
    "Krishna Chaturdashi",
    "Amavasya",
]

KARANA_SEQUENCE = [
    "Bava",
    "Balava",
    "Kaulava",
    "Taitila",
    "Garaja",
    "Vanija",
    "Vishti",
] * 8

SPECIAL_KARANAS = {
    0: "Kimstughna",
    57: "Shakuni",
    58: "Chatushpada",
    59: "Naga",
}


def normalize_degrees(value: float) -> float:
    return value % 360.0


def compute_tithi_and_karana(sun_longitude: float, moon_longitude: float) -> dict:
    phase = normalize_degrees(moon_longitude - sun_longitude)
    tithi_index = int(phase // 12.0) + 1
    tithi_name = TITHI_NAMES[tithi_index - 1]

    karana_slot = int(phase // 6.0)
    karana_name = SPECIAL_KARANAS.get(karana_slot)
    if karana_name is None:
        karana_name = KARANA_SEQUENCE[(karana_slot - 1) % len(KARANA_SEQUENCE)]

    return {
        "tithi": {"index": tithi_index, "name": tithi_name},
        "karana": {"index": karana_slot + 1, "name": karana_name},
    }

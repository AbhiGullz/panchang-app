RASHI_NAMES = [
    "Mesha",
    "Vrishabha",
    "Mithuna",
    "Karka",
    "Simha",
    "Kanya",
    "Tula",
    "Vrischika",
    "Dhanu",
    "Makara",
    "Kumbha",
    "Meena",
]


def compute_moon_sign(moon_longitude_sidereal: float) -> str:
    value = moon_longitude_sidereal % 360.0
    index = int(value // 30.0)
    return RASHI_NAMES[index]

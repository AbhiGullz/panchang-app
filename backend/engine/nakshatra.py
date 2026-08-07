NAKSHATRA_NAMES = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashirsha",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
]


def compute_nakshatra(moon_longitude_sidereal: float) -> dict:
    span = 360.0 / 27.0
    value = moon_longitude_sidereal % 360.0
    index = int(value // span) + 1
    pada = int((value % span) // (span / 4.0)) + 1
    return {"index": index, "name": NAKSHATRA_NAMES[index - 1], "pada": pada}

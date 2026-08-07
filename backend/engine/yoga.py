YOGA_NAMES = [
    "Vishkambha",
    "Priti",
    "Ayushman",
    "Saubhagya",
    "Shobhana",
    "Atiganda",
    "Sukarman",
    "Dhriti",
    "Shoola",
    "Ganda",
    "Vriddhi",
    "Dhruva",
    "Vyaghata",
    "Harshana",
    "Vajra",
    "Siddhi",
    "Vyatipata",
    "Variyana",
    "Parigha",
    "Shiva",
    "Siddha",
    "Sadhya",
    "Shubha",
    "Shukla",
    "Brahma",
    "Indra",
    "Vaidhriti",
]


def compute_yoga(sun_longitude_sidereal: float, moon_longitude_sidereal: float) -> dict:
    total = (sun_longitude_sidereal + moon_longitude_sidereal) % 360.0
    span = 360.0 / 27.0
    index = int(total // span) + 1
    return {"index": index, "name": YOGA_NAMES[index - 1]}

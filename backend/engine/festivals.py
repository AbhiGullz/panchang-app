from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timezone, timedelta
from zoneinfo import ZoneInfo

import swisseph as swe

from .core import init_swisseph
from .i18n.names import get_month_name

LUNAR_MONTH_NAMES = [
    "Chaitra",
    "Vaishakha",
    "Jyeshtha",
    "Ashadha",
    "Shravana",
    "Bhadrapada",
    "Ashwin",
    "Kartika",
    "Margashirsha",
    "Pausha",
    "Magha",
    "Phalguna",
]

LUNAR_MONTH_INDEX = {name: index + 1 for index, name in enumerate(LUNAR_MONTH_NAMES)}

FESTIVAL_NAMES = {
    "en": {},
    "hi": {"Diwali": "दीपावली", "Holi": "होली", "Raksha Bandhan": "रक्षाबंधन", "Janmashtami": "जन्माष्टमी", "Mahashivaratri": "महाशिवरात्रि", "Navratri Day 1": "शारदीय नवरात्रि प्रारंभ", "Dussehra": "दशहरा", "Makar Sankranti": "मकर संक्रांति", "Pongal": "पोंगल", "Onam": "ओणम", "Ganesh Chaturthi": "गणेश चतुर्थी", "Karva Chauth": "करवा चौथ", "Gudi Padwa": "गुड़ी पड़वा", "Ugadi": "उगादी", "Baisakhi": "बैसाखी"},
    "mr": {"Diwali": "दिवाळी", "Holi": "होळी", "Raksha Bandhan": "रक्षाबंधन", "Janmashtami": "जन्माष्टमी", "Mahashivaratri": "महाशिवरात्री", "Navratri Day 1": "शारदीय नवरात्री प्रारंभ", "Dussehra": "दसरा", "Makar Sankranti": "मकर संक्रांत", "Pongal": "पोंगल", "Onam": "ओणम", "Ganesh Chaturthi": "गणेश चतुर्थी", "Karva Chauth": "करवा चौथ", "Gudi Padwa": "गुढी पाडवा", "Ugadi": "उगादी", "Baisakhi": "बैसाखी"},
    "ta": {"Diwali": "தீபாவளி", "Holi": "ஹோலி", "Raksha Bandhan": "ரக்ஷா பந்தன்", "Janmashtami": "ஜன்மாஷ்டமி", "Mahashivaratri": "மகா சிவராத்திரி", "Navratri Day 1": "நவராத்திரி தொடக்கம்", "Dussehra": "தசரா", "Makar Sankranti": "மகர சங்கராந்தி", "Pongal": "பொங்கல்", "Onam": "ஓணம்", "Ganesh Chaturthi": "விநாயகர் சதுர்த்தி", "Karva Chauth": "கர்வா சௌத்", "Gudi Padwa": "குடி பட்வா", "Ugadi": "உகாதி", "Baisakhi": "வைசாகி"},
    "te": {"Diwali": "దీపావళి", "Holi": "హోలీ", "Raksha Bandhan": "రక్షా బంధన్", "Janmashtami": "జన్మాష్టమి", "Mahashivaratri": "మహాశివరాత్రి", "Navratri Day 1": "నవరాత్రి ప్రారంభం", "Dussehra": "దసరా", "Makar Sankranti": "మకర సంక్రాంతి", "Pongal": "పొంగల్", "Onam": "ఓణం", "Ganesh Chaturthi": "వినాయక చవితి", "Karva Chauth": "కర్వా చౌత్", "Gudi Padwa": "గుడి పడ్వా", "Ugadi": "ఉగాది", "Baisakhi": "వైశాఖి"},
    "kn": {"Diwali": "ದೀಪಾವಳಿ", "Holi": "ಹೋಳಿ", "Raksha Bandhan": "ರಕ್ಷಾ ಬಂಧನ", "Janmashtami": "ಜನ್ಮಾಷ್ಟಮಿ", "Mahashivaratri": "ಮಹಾಶಿವರಾತ್ರಿ", "Navratri Day 1": "ನವರಾತ್ರಿ ಆರಂಭ", "Dussehra": "ದಸರಾ", "Makar Sankranti": "ಮಕರ ಸಂಕ್ರಾಂತಿ", "Pongal": "ಪೊಂಗಲ್", "Onam": "ಓಣಂ", "Ganesh Chaturthi": "ಗಣೇಶ ಚತುರ್ಥಿ", "Karva Chauth": "ಕರ್ವಾ ಚೌತ್", "Gudi Padwa": "ಗುಡಿ ಪಾಡ್ವಾ", "Ugadi": "ಉಗಾದಿ", "Baisakhi": "ಬೈಶಾಖಿ"},
    "ml": {"Diwali": "ദീപാവലി", "Holi": "ഹോളി", "Raksha Bandhan": "രക്ഷാബന്ധൻ", "Janmashtami": "ജന്മാഷ്ടമി", "Mahashivaratri": "മഹാശിവരാത്രി", "Navratri Day 1": "നവരാത്രി ആരംഭം", "Dussehra": "ദസറ", "Makar Sankranti": "മകര സംക്രാന്തി", "Pongal": "പൊങ്കൽ", "Onam": "ഓണം", "Ganesh Chaturthi": "വിനായക ചതുർത്ഥി", "Karva Chauth": "കർവാ ചൗത്ത്", "Gudi Padwa": "ഗുഡി പാഡ്വ", "Ugadi": "ഉഗാദി", "Baisakhi": "വൈശാഖി"},
    "gu": {"Diwali": "દિવાળી", "Holi": "હોળી", "Raksha Bandhan": "રક્ષાબંધન", "Janmashtami": "જન્માષ્ટમી", "Mahashivaratri": "મહાશિવરાત્રી", "Navratri Day 1": "નવરાત્રી પ્રારંભ", "Dussehra": "દશેરા", "Makar Sankranti": "મકર સંક્રાંતિ", "Pongal": "પોંગલ", "Onam": "ઓણમ", "Ganesh Chaturthi": "ગણેશ ચતુર્થી", "Karva Chauth": "કરવા ચોથ", "Gudi Padwa": "ગુડી પડવો", "Ugadi": "ઉગાદી", "Baisakhi": "વૈશાખી"},
    "bn": {"Diwali": "দীপাবলি", "Holi": "হোলি", "Raksha Bandhan": "রাখীবন্ধন", "Janmashtami": "জন্মাষ্টমী", "Mahashivaratri": "মহাশিবরাত্রি", "Navratri Day 1": "নবরাত্রি শুরু", "Dussehra": "দশেরা", "Makar Sankranti": "মকর সংক্রান্তি", "Pongal": "পোঙ্গল", "Onam": "ওনাম", "Ganesh Chaturthi": "গণেশ চতুর্থী", "Karva Chauth": "করবা চৌথ", "Gudi Padwa": "গুড়ি পাড়ওয়া", "Ugadi": "উগাদি", "Baisakhi": "বৈশাখী"},
    "pa": {"Diwali": "ਦੀਵਾਲੀ", "Holi": "ਹੋਲੀ", "Raksha Bandhan": "ਰੱਖੜੀ", "Janmashtami": "ਜਨਮ ਅਸ਼ਟਮੀ", "Mahashivaratri": "ਮਹਾ ਸ਼ਿਵਰਾਤਰੀ", "Navratri Day 1": "ਨਵਰਾਤਰੀ ਆਰੰਭ", "Dussehra": "ਦਸਹਿਰਾ", "Makar Sankranti": "ਮਕਰ ਸੰਕ੍ਰਾਂਤੀ", "Pongal": "ਪੋਂਗਲ", "Onam": "ਓਣਮ", "Ganesh Chaturthi": "ਗਣੇਸ਼ ਚਤੁਰਥੀ", "Karva Chauth": "ਕਰਵਾ ਚੌਥ", "Gudi Padwa": "ਗੁੜੀ ਪੜਵਾ", "Ugadi": "ਉਗਾਦੀ", "Baisakhi": "ਵਿਸਾਖੀ"},
}


@dataclass(frozen=True)
class FestivalRule:
    name: str
    month: str
    paksha: str
    tithi: int
    calendar_school: str
    region: str
    source: str
    notes: str = ""
    duration_days: int = 1


FESTIVAL_RULES = [
    FestivalRule("Diwali", "Kartika", "Krishna", 30, "amanta", "pan-India", "DrikPanchang festival page", "Amavasya observance; month label differs by school."),
    FestivalRule("Holi", "Phalguna", "Shukla", 15, "amanta", "north-india", "DrikPanchang festival page", "Holika Dahan/Purnima observance."),
    FestivalRule("Raksha Bandhan", "Shravana", "Shukla", 15, "amanta", "pan-India", "DrikPanchang festival page"),
    FestivalRule("Janmashtami", "Bhadrapada", "Krishna", 8, "amanta", "pan-India", "ISKCON calendar", "Smarta-style sunrise tithi simplification."),
    FestivalRule("Mahashivaratri", "Magha", "Krishna", 14, "amanta", "pan-India", "DrikPanchang festival page"),
    FestivalRule("Navratri Day 1", "Ashwin", "Shukla", 1, "amanta", "pan-India", "DrikPanchang festival page", "Sharad Navratri begins.", duration_days=9),
    FestivalRule("Dussehra", "Ashwin", "Shukla", 10, "amanta", "pan-India", "DrikPanchang festival page"),
    FestivalRule("Makar Sankranti", "solar-makara", "solar", 1, "solar", "pan-India", "DrikPanchang festival page", "Sun enters sidereal Makara."),
    FestivalRule("Pongal", "solar-makara", "solar", 1, "solar", "tamil-nadu", "DrikPanchang festival page", "Aligned to Makara Sankranti day in this simplified engine."),
    FestivalRule("Onam", "Simha", "solar", 1, "solar", "kerala", "DrikPanchang festival page", "Simplified to Thiruvonam solar month anchor."),
    FestivalRule("Ganesh Chaturthi", "Bhadrapada", "Shukla", 4, "amanta", "maharashtra", "DrikPanchang festival page"),
    FestivalRule("Karva Chauth", "Kartika", "Krishna", 4, "amanta", "north-india", "DrikPanchang festival page"),
    FestivalRule("Gudi Padwa", "Chaitra", "Shukla", 1, "amanta", "maharashtra", "DrikPanchang festival page"),
    FestivalRule("Ugadi", "Chaitra", "Shukla", 1, "amanta", "andhra-karnataka-telangana", "DrikPanchang festival page"),
    FestivalRule("Baisakhi", "Mesha", "solar", 1, "solar", "punjab", "DrikPanchang festival page", "Sidereal Mesha ingress approximation."),
]


def _local_midnight_to_jd(target_date: date, timezone_name: str) -> float:
    local_dt = datetime.combine(target_date, time.min, tzinfo=ZoneInfo(timezone_name))
    utc_dt = local_dt.astimezone(timezone.utc)
    return swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0,
        swe.GREG_CAL,
    )


def _gregorian_from_jd(jd_ut: float, timezone_name: str) -> date:
    year, month, day, hour = swe.revjul(jd_ut, swe.GREG_CAL)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    second = int(round((((hour - hour_int) * 60) - minute) * 60))
    dt_utc = datetime(year, month, day, hour_int, minute, min(second, 59), tzinfo=timezone.utc)
    return dt_utc.astimezone(ZoneInfo(timezone_name)).date()


def _phase_details(jd_ut: float) -> tuple[int, str, int]:
    sun = swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SWIEPH)[0][0] % 360.0
    moon = swe.calc_ut(jd_ut, swe.MOON, swe.FLG_SWIEPH)[0][0] % 360.0
    phase = (moon - sun) % 360.0
    tithi_index = int(phase // 12.0) + 1
    if tithi_index <= 15:
        return tithi_index, "Shukla", tithi_index
    return tithi_index, "Krishna", tithi_index - 15


def _new_moon_before(jd_ut: float) -> float:
    current = jd_ut
    previous_phase = None
    previous_jd = current
    for _ in range(70):
        phase = (swe.calc_ut(current, swe.MOON, swe.FLG_SWIEPH)[0][0] - swe.calc_ut(current, swe.SUN, swe.FLG_SWIEPH)[0][0]) % 360.0
        if previous_phase is not None and phase > previous_phase:
            low, high = current, previous_jd
            for _ in range(40):
                mid = (low + high) / 2
                mid_phase = (swe.calc_ut(mid, swe.MOON, swe.FLG_SWIEPH)[0][0] - swe.calc_ut(mid, swe.SUN, swe.FLG_SWIEPH)[0][0]) % 360.0
                if mid_phase < 180:
                    high = mid
                else:
                    low = mid
            return (low + high) / 2
        previous_phase = phase
        previous_jd = current
        current -= 1.0
    return jd_ut


def _amanta_month_name(jd_ut: float) -> str:
    _, paksha, _ = _phase_details(jd_ut)
    reference_jd = jd_ut if paksha == "Shukla" else jd_ut + 15.0
    new_moon_jd = _new_moon_before(reference_jd)
    sun_sidereal = swe.calc_ut(new_moon_jd + 0.1, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0] % 360.0
    solar_index = int(sun_sidereal // 30.0)
    return LUNAR_MONTH_NAMES[(solar_index - 11) % 12]


def _solar_rashi_name(jd_ut: float) -> str:
    solar_index = int((swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0] % 360.0) // 30.0)
    return ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"][solar_index]


def _find_lunar_date(year: int, month_name: str, paksha: str, tithi: int, timezone_name: str = "Asia/Kolkata") -> date | None:
    for offset in range(366):
        current_date = date(year, 1, 1) + timedelta(days=offset)
        jd_ut = _local_midnight_to_jd(current_date, timezone_name)
        _, current_paksha, current_tithi = _phase_details(jd_ut)
        current_month = _amanta_month_name(jd_ut)
        if current_month == month_name and current_paksha == paksha and current_tithi == tithi:
            return current_date
    return None


def _find_solar_date(year: int, rashi_name: str, timezone_name: str = "Asia/Kolkata") -> date | None:
    previous = None
    for offset in range(366):
        current_date = date(year, 1, 1) + timedelta(days=offset)
        jd_ut = _local_midnight_to_jd(current_date, timezone_name)
        current = _solar_rashi_name(jd_ut)
        if current == rashi_name and previous != rashi_name:
            return current_date
        previous = current
    return None


def compute_festivals_for_year(year: int, calendar: str = "amanta", lang: str = "en") -> list[dict[str, str | list[str]]]:
    init_swisseph()
    festivals: list[dict[str, str | list[str]]] = []
    for rule in FESTIVAL_RULES:
        if rule.calendar_school == "solar":
            mapping = {
                "solar-makara": "Makara",
                "Simha": "Simha",
                "Mesha": "Mesha",
            }
            target = _find_solar_date(year, mapping[rule.month])
        else:
            target = _find_lunar_date(year, rule.month, rule.paksha, rule.tithi)
        if target is None:
            item = {
                    "name": rule.name,
                    "date": "unverified",
                    "calendar_school": calendar,
                    "localized_name": FESTIVAL_NAMES.get(lang, {}).get(rule.name, rule.name),
                    "region": rule.region,
                    "source": rule.source,
                    "notes": f"{rule.notes} Unable to verify in engine run.",
                }
            if rule.calendar_school != "solar":
                item["lunar_month"] = get_month_name(calendar, LUNAR_MONTH_INDEX[rule.month], lang)
            festivals.append(item)
            continue
        item = {
            "name": rule.name,
            "date": target.isoformat(),
            "calendar_school": calendar,
            "localized_name": FESTIVAL_NAMES.get(lang, {}).get(rule.name, rule.name),
            "region": rule.region,
            "source": rule.source,
            "notes": rule.notes,
        }
        if rule.calendar_school != "solar":
            item["lunar_month"] = get_month_name(calendar, LUNAR_MONTH_INDEX[rule.month], lang)
        if rule.duration_days > 1:
            item["dates"] = [(target + timedelta(days=i)).isoformat() for i in range(rule.duration_days)]
        festivals.append(item)
    festivals.sort(key=lambda item: item["date"])
    return festivals

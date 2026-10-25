"""Regional observances: independent of display language and calendar labels.

Lunar rules use Amanta month numbers, tithi at local sunrise (Kojagiri at
local midnight). These are calendar reminders, not Ekadashi parana schedules.
"""
from datetime import date, datetime, time, timedelta
from functools import lru_cache
from zoneinfo import ZoneInfo

import swisseph as swe

from .transitions import next_phase_boundary, _jd

LANGUAGES = ('en', 'hi', 'mr', 'ta', 'te', 'kn', 'ml', 'gu', 'bn', 'pa')
# Names are proper names, supplied explicitly rather than machine transliterated.
NAMES = {
    'kojagiri': ['Kojagiri / Sharad Purnima', 'कोजागरी / शरद पूर्णिमा', 'कोजागिरी पौर्णिमा', 'கோஜாகிரி / சரத் பௌர்ணமி', 'కోజాగిరి / శరద్ పౌర్ణమి', 'ಕೋಜಾಗಿರಿ / ಶರದ್ ಪೂರ್ಣಿಮೆ', 'കോജാഗിരി / ശരദ് പൗർണമി', 'કોજાગરી / શરદ પૂર્ણિમા', 'কোজাগরী / শারদ পূর্ণিমা', 'ਕੋਜਾਗਰੀ / ਸ਼ਰਦ ਪੂਰਨਿਮਾ'],
    'shayani': ['Devshayani (Ashadhi) Ekadashi', 'देवशयनी एकादशी', 'आषाढी / देवशयनी एकादशी', 'தேவசயனி ஏகாதசி', 'దేవశయనీ ఏకాదశి', 'ದೇವಶಯನಿ ಏಕಾದಶಿ', 'ദേവശയനി ഏകാദശി', 'દેવશયની એકાદશી', 'দেবশয়নী একাদশী', 'ਦੇਵਸ਼ਯਨੀ ਇਕਾਦਸ਼ੀ'],
    'yogini': ['Yogini Ekadashi', 'योगिनी एकादशी', 'योगिनी एकादशी', 'யோகினி ஏகாதசி', 'యోగినీ ఏకాదశి', 'ಯೋಗಿನಿ ಏಕಾದಶಿ', 'യോഗിനി ഏകാദശി', 'યોગિની એકાદશી', 'যোগিনী একাদশী', 'ਯੋਗਿਨੀ ਇਕਾਦਸ਼ੀ'],
    'utthana': ['Devutthana (Prabodhini) Ekadashi', 'देवोत्थान / प्रबोधिनी एकादशी', 'कार्तिकी / प्रबोधिनी एकादशी', 'தேவோத்தான ஏகாதசி', 'దేవోత్థాన ఏకాదశి', 'ಪ್ರಬೋಧಿನಿ ಏಕಾದಶಿ', 'പ്രബോധിനി ഏകാദശി', 'દેવઊઠી એકાદશી', 'উত্থান একাদশী', 'ਦੇਵਉੱਠਨੀ ਇਕਾਦਸ਼ੀ'],
    'gajanan-prakat': ['Gajanan Maharaj Prakat Din', 'गजानन महाराज प्रकट दिन', 'गजानन महाराज प्रकट दिन', 'கஜானன் மகராஜ் பிரகட தினம்', 'గజానన మహారాజ్ ప్రకట దినం', 'ಗಜಾನನ ಮಹಾರಾಜ್ ಪ್ರಕಟ ದಿನ', 'ഗജാനൻ മഹാരാജ് പ്രകട ദിനം', 'ગજાનન મહારાજ પ્રકટ દિન', 'গজানন মহারাজ প্রকট দিবস', 'ਗਜਾਨਨ ਮਹਾਰਾਜ ਪ੍ਰਗਟ ਦਿਵਸ'],
    'gajanan-punyatithi': ['Gajanan Maharaj Punyatithi', 'गजानन महाराज पुण्यतिथि', 'गजानन महाराज पुण्यतिथी', 'கஜானன் மகராஜ் புண்ணிய திதி', 'గజానన మహారాజ్ పుణ్యతిథి', 'ಗಜಾನನ ಮಹಾರಾಜ್ ಪುಣ್ಯತಿಥಿ', 'ഗജാനൻ മഹാരാജ് പുണ്യതിഥി', 'ગજાનન મહારાજ પુણ્યતિથિ', 'গজানন মহারাজ পুণ্যতিথি', 'ਗਜਾਨਨ ਮਹਾਰਾਜ ਪੁੰਨ ਤਿਥੀ'],
    'shivaji': ['Shivaji Maharaj Jayanti (Tithi)', 'शिवाजी महाराज जयंती (तिथि)', 'शिवजयंती (तिथीनुसार)', 'சிவாஜி மகராஜ் ஜெயந்தி (திதி)', 'శివాజీ మహారాజ్ జయంతి (తిథి)', 'ಶಿವಾಜಿ ಮಹಾರಾಜ್ ಜಯಂತಿ (ತಿಥಿ)', 'ശിവാജി മഹാരാജ് ജയന്തി (തിഥി)', 'શિવાજી મહારાજ જયંતી (તિથિ)', 'শিবাজি মহারাজ জয়ন্তী (তিথি)', 'ਸ਼ਿਵਾਜੀ ਮਹਾਰਾਜ ਜਯੰਤੀ (ਤਿਥੀ)'],
    'rama': ['Rama Navami', 'राम नवमी', 'रामनवमी', 'ராம நவமி', 'శ్రీరామ నవమి', 'ರಾಮ ನವಮಿ', 'രാമനവമി', 'રામ નવમી', 'রাম নবমী', 'ਰਾਮ ਨੌਮੀ'],
    'akshaya': ['Akshaya Tritiya', 'अक्षय तृतीया', 'अक्षय्य तृतीया', 'அட்சய திருதியை', 'అక్షయ తృతీయ', 'ಅಕ್ಷಯ ತೃತೀಯ', 'അക്ഷയ തൃതീയ', 'અખાત્રીજ', 'অক্ষয় তৃতীয়া', 'ਅਕਸ਼ੈ ਤ੍ਰਿਤੀਆ'],
    'rishi': ['Rishi Panchami', 'ऋषि पंचमी', 'ऋषिपंचमी', 'ரிஷி பஞ்சமி', 'ఋషి పంచమి', 'ಋಷಿ ಪಂಚಮಿ', 'ഋഷി പഞ്ചമി', 'ઋષિ પંચમી', 'ঋষি পঞ্চমী', 'ਰਿਸ਼ੀ ਪੰਚਮੀ'],
    'ratha': ['Ratha Saptami', 'रथ सप्तमी', 'रथसप्तमी', 'ரத சப்தமி', 'రథ సప్తమి', 'ರಥ ಸಪ್ತಮಿ', 'രഥ സപ്തമി', 'રથ સપ્તમી', 'রথ সপ্তমী', 'ਰਥ ਸਪਤਮੀ'],
    'chitra': ['Chitra Pournami', 'चित्रा पूर्णिमा', 'चित्रा पौर्णिमा', 'சித்ரா பௌர்ணமி', 'చిత్రా పౌర్ణమి', 'ಚಿತ್ರಾ ಪೂರ್ಣಿಮೆ', 'ചിത്രാ പൗർണമി', 'ચિત્રા પૂર્ણિમા', 'চিত্রা পূর্ণিমা', 'ਚਿਤਰਾ ਪੂਰਨਿਮਾ'],
    'thaipusam': ['Thaipusam', 'थाईपूसम', 'थाईपूसम', 'தைப்பூசம்', 'థైపూసం', 'ತೈಪೂಸಂ', 'തൈപ്പൂയം', 'થાઈપૂસમ', 'থাইপুসম', 'ਥਾਈਪੂਸਮ'],
    'panguni': ['Panguni Uthiram', 'पंगुनी उत्तिरम', 'पंगुनी उत्तिरम', 'பங்குனி உத்திரம்', 'పంగుని ఉత్తిరం', 'ಪಂಗುನಿ ಉತ್ತಿರಂ', 'പങ്കുനി ഉത്രം', 'પંગુની ઉત્તિરમ', 'পঙ্গুনি উত্তিরম', 'ਪੰਗੁਨੀ ਉੱਤਿਰਮ'],
}

DHARMA = 'https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=4'
GAJANAN = 'https://gajananmaharaj.org/sgmsenglish/punyatithi.htm'
PALANI = 'https://palani.org/festivals/'
# id, Amanta month (1=Chaitra), absolute tithi, region, reference, sample
RULES = [
    ('kojagiri', 7, 15, 'pan-India', DHARMA, 'midnight'),
    ('shayani', 4, 11, 'pan-India', DHARMA, 'sunrise'),
    ('yogini', 3, 26, 'pan-India', DHARMA, 'sunrise'),
    ('utthana', 8, 11, 'pan-India', DHARMA, 'sunrise'),
    ('gajanan-prakat', 11, 22, 'maharashtra', 'https://shreegajanangunjan.org/index.php/sample-page/mauli0/maulipd/', 'sunrise'),
    ('gajanan-punyatithi', 6, 5, 'maharashtra', GAJANAN, 'sunrise'),
    ('shivaji', 12, 18, 'maharashtra', 'https://www.drikpanchang.com/calendars/indian/jayanti/shivaji/chhatrapati-shivaji-jayanti.html', 'sunrise'),
    ('rama', 1, 9, 'pan-India', DHARMA, 'noon'),
    ('akshaya', 2, 3, 'pan-India', DHARMA, 'sunrise'),
    ('rishi', 6, 5, 'pan-India', GAJANAN, 'sunrise'),
    ('ratha', 11, 7, 'andhra-karnataka-telangana', DHARMA, 'sunrise'),
]


@lru_cache(maxsize=8192)
def _month(jd: float) -> tuple[int, bool]:
    # The solar sign at the ending new moon identifies the Amanta month.
    center = datetime.fromtimestamp((jd - 2440587.5) * 86400, ZoneInfo('UTC'))
    end = next_phase_boundary(center, 0.0)
    start = next_phase_boundary(end - timedelta(days=32), 0.0)
    def sign(dt):
        return int(swe.calc_ut(_jd(dt), swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0] % 360 // 30)
    return sign(end) + 1, sign(start) == sign(end)


@lru_cache(maxsize=64)
def regional_observances(year: int, lat: float, lng: float, tz: str, lang: str) -> tuple[dict, ...]:
    zone = ZoneInfo(tz)
    language_index = LANGUAGES.index(lang)
    result = []
    seen = set()
    current = date(year, 1, 1)
    while current.year == year:
        midnight = datetime.combine(current, time.min, zone)
        jd = _jd(midnight)
        status, event = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE, (lng, lat, 0), flags=swe.FLG_SWIEPH)
        # Do not invent a sunrise-based observance at polar locations.
        samples = {'midnight': _jd(midnight + timedelta(days=1)), 'noon': _jd(midnight.replace(hour=12))}
        if status == 0:
            samples['sunrise'] = event[0]
        def tithi_at(point):
            phase = (swe.calc_ut(point, swe.MOON)[0][0] - swe.calc_ut(point, swe.SUN)[0][0]) % 360
            return int(phase // 12) + 1
        for key, month, tithi, region, source, sample in RULES:
            point = samples.get(sample)
            if point is None:
                continue
            basis = sample
            if tithi_at(point) != tithi:
                # A short tithi can fall entirely between two sunrises.
                # Preserve it as a daytime calendar reminder, without claiming
                # this determines the fasting day or parana for a sampradaya.
                if sample != 'sunrise' or tithi_at(samples['noon']) != tithi:
                    continue
                next_status, next_rise = swe.rise_trans(_jd(midnight + timedelta(days=1)), swe.SUN, swe.CALC_RISE, (lng, lat, 0), flags=swe.FLG_SWIEPH)
                if next_status == 0 and tithi_at(next_rise[0]) == tithi:
                    continue
                point = samples['noon']
                basis = 'daytime-tithi-reminder'
            month_number, adhika = _month(point)
            if month_number != month or adhika:
                continue
            # A repeated sunrise tithi is represented once in the annual list.
            identity = (key, month_number)
            if identity in seen:
                continue
            seen.add(identity)
            result.append({'id': key, 'name': NAMES[key][0], 'localized_name': NAMES[key][language_index], 'date': current.isoformat(), 'region': region, 'source': source, 'calculation_basis': basis, 'category': 'observance'})
        # Tamil festivals follow solar months and nakshatras, not lunar labels.
        point = samples.get('sunrise')
        if point is not None:
            sun_sign = int(swe.calc_ut(point, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0] % 360 // 30)
            star = int(swe.calc_ut(point, swe.MOON, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0] % 360 / (360 / 27)) + 1
            phase = (swe.calc_ut(point, swe.MOON)[0][0] - swe.calc_ut(point, swe.SUN)[0][0]) % 360
            for key, match in [('thaipusam', sun_sign == 9 and star == 8), ('panguni', sun_sign == 11 and star == 12), ('chitra', sun_sign == 0 and int(phase // 12) + 1 == 15)]:
                if match and key not in seen:
                    seen.add(key)
                    result.append({'id': key, 'name': NAMES[key][0], 'localized_name': NAMES[key][language_index], 'date': current.isoformat(), 'region': 'tamil-nadu', 'source': PALANI, 'calculation_basis': 'sunrise', 'category': 'observance'})
        current += timedelta(days=1)
    return tuple(result)

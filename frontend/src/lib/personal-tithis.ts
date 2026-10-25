import type { FestivalItem, LanguageCode } from '../types/api'
import { humanizeCalendar } from './utils'
import { sankalpaScript } from './sankalpa-script'

export interface PersonalTithi {
  id: string
  name: string
  date: string
  calendar: 'amanta' | 'purnimanta'
  lat: number
  lng: number
  tz: string
  place?: string
  rule: { month: number; tithi: number; adhika: boolean; calendar: string }
  month_names: Record<string, string>
  tithi_names: Record<string, string>
}
export type PersonalPreview = Pick<PersonalTithi, 'rule' | 'month_names' | 'tithi_names'> & { dates: string[] }
const KEY = 'gajaa-personal-tithis-v1'
export function loadPersonalTithis(): PersonalTithi[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(rows) ? rows.filter((x): x is PersonalTithi => Boolean(x && typeof x.name === 'string' && typeof x.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && ['amanta', 'purnimanta'].includes(x.calendar) && Number.isFinite(x.lat) && Number.isFinite(x.lng) && typeof x.tz === 'string' && Number.isInteger(x.rule?.month) && x.rule.month >= 1 && x.rule.month <= 12 && Number.isInteger(x.rule?.tithi) && x.rule.tithi >= 1 && x.rule.tithi <= 30 && x.month_names && x.tithi_names)) : []
  } catch { return [] }
}
export function savePersonalTithis(items: PersonalTithi[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('gajaa:personal-tithis'))
}
export async function personalPreview(item: Pick<PersonalTithi, 'date' | 'calendar' | 'lat' | 'lng' | 'tz'> & { rule?: PersonalTithi['rule'] }, year: number): Promise<PersonalPreview> {
  const params = new URLSearchParams({ date: item.date, calendar: item.calendar, lat: String(item.lat), lng: String(item.lng), tz: item.tz, year: String(year) })
  if (item.rule) {
    params.set('month', String(item.rule.month)); params.set('tithi', String(item.rule.tithi)); params.set('adhika', String(item.rule.adhika))
  }
  const response = await fetch(`/api/v1/personal-tithi?${params}`)
  if (!response.ok) throw new Error('Unable to calculate personal tithi')
  return response.json()
}
export async function personalEvents(items: PersonalTithi[], year: number, language = 'en'): Promise<FestivalItem[]> {
  return (await Promise.all(items.map(async item => {
    const result = await personalPreview(item, year)
    return result.dates.map(date => ({ id: item.id, name: item.name, localized_name: personalName(item.name, language), date, region: 'personal' }))
  }))).flat()
}
export function personalName(value: string, language: string) {
  language = language.split('-')[0] ?? language
  const names: Record<string, string> = { hi: 'माता की पुण्यतिथि', mr: 'आईची पुण्यतिथी', ta: 'அன்னையின் நினைவு திதி', te: 'అమ్మ పుణ్యతిథి', kn: 'ತಾಯಿಯ ಪುಣ್ಯತಿಥಿ', ml: 'അമ്മയുടെ പുണ്യതിഥി', gu: 'માતાની પુણ્યતિથિ', bn: 'মায়ের পুণ্যতিথি', pa: 'ਮਾਤਾ ਦੀ ਪੁੰਨ ਤਿਥੀ' }
  if (/^mother['’]?s\s+punyatithi$/i.test(value.trim()) && language !== 'en') return names[language] ?? value
  return sankalpaScript(value, language as LanguageCode)
}
export function todayAt(tz: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}
export function personalId() {
  // randomUUID is unavailable on the private HTTP development URL.
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('')
}
export function personalRuleLabel(item: Pick<PersonalTithi, 'calendar' | 'rule' | 'month_names' | 'tithi_names'>, language: string) {
  language = language.split('-')[0] ?? language
  const adhika: Record<string, string> = { en: 'Adhika', hi: 'अधिक', mr: 'अधिक', ta: 'அதிக', te: 'అధిక', kn: 'ಅಧಿಕ', ml: 'അധിക', gu: 'અધિક', bn: 'অধিক', pa: 'ਅਧਿਕ' }
  return `${item.month_names[language] ?? item.month_names.en} · ${item.tithi_names[language] ?? item.tithi_names.en} · ${humanizeCalendar(item.calendar, language)}${item.rule.adhika ? ` · ${adhika[language] ?? adhika.en}` : ''}`
}
const COPY: Record<LanguageCode, string[]> = {
  en: ['My Tithis', 'Choose a Gregorian date. Its lunar month and tithi are saved using the Amanta or Purnimanta setting currently selected. Later setting changes do not change saved rules. Recurrences use the saved location, first sunrise for repeated tithis; a skipped sunrise tithi may have no reminder that year.', 'Name of observance', 'Gregorian date', 'Preview tithi', 'Save tithi', 'Delete', 'Stored only on this device. Clearing browser data removes these records.', 'Select Amanta or Purnimanta in Settings first.', 'Could not calculate or save. Please retry.', 'No matching sunrise in this year.', 'Upcoming dates'],
  hi: ['मेरी तिथियाँ', 'अंग्रेज़ी तारीख चुनें। मास और तिथि वर्तमान अमान्त या पूर्णिमान्त सेटिंग से सहेजे जाएँगे। बाद में सेटिंग बदलने से सहेजा नियम नहीं बदलेगा। सहेजे स्थान का पहला सूर्योदय लिया जाता है; क्षय तिथि का अनुस्मारक उस वर्ष नहीं मिल सकता।', 'पर्व का नाम', 'अंग्रेज़ी तारीख', 'तिथि देखें', 'तिथि सहेजें', 'हटाएँ', 'केवल इस डिवाइस पर सहेजा जाता है। ब्राउज़र डेटा मिटाने से रिकॉर्ड हटेंगे।', 'पहले सेटिंग्स में अमान्त या पूर्णिमान्त चुनें।', 'गणना या सहेजना विफल। पुनः प्रयास करें।', 'इस वर्ष मेल खाता सूर्योदय नहीं मिला।', 'आगामी तारीखें'],
  mr: ['माझ्या तिथी', 'इंग्रजी तारीख निवडा. सध्याच्या अमांत किंवा पौर्णिमांत सेटिंगनुसार मास व तिथी जतन होतील. नंतर सेटिंग बदलल्याने नियम बदलत नाही. जतन केलेले स्थान व पहिला सूर्योदय वापरला जातो; क्षय तिथीचे स्मरण त्या वर्षी मिळेलच असे नाही.', 'स्मरणदिनाचे नाव', 'इंग्रजी तारीख', 'तिथी पाहा', 'तिथी जतन करा', 'काढा', 'फक्त या उपकरणावर जतन होते. ब्राउझर डेटा पुसल्यास नोंदी हटतील.', 'प्रथम सेटिंगमध्ये अमांत किंवा पौर्णिमांत निवडा.', 'गणना किंवा जतन अयशस्वी. पुन्हा प्रयत्न करा.', 'या वर्षी जुळणारा सूर्योदय नाही.', 'पुढील तारखा'],
  ta: ['எனது திதிகள்', 'ஆங்கில தேதியைத் தேர்ந்தெடுக்கவும். தற்போதைய அமாந்த அல்லது பூர்ணிமாந்த அமைப்பின்படி மாதமும் திதியும் சேமிக்கப்படும். பின்னர் அமைப்பை மாற்றினாலும் விதி மாறாது. சேமித்த இடத்தின் முதல் சூரிய உதயம் பயன்படுத்தப்படும்; விடுபடும் திதிக்கு அந்த ஆண்டு நினைவூட்டல் இல்லாமல் இருக்கலாம்.', 'நிகழ்வின் பெயர்', 'ஆங்கில தேதி', 'திதியைப் பார்க்க', 'திதியைச் சேமிக்க', 'நீக்கு', 'இந்தச் சாதனத்தில் மட்டுமே சேமிக்கப்படும். உலாவித் தரவை அழித்தால் பதிவுகள் நீங்கும்.', 'முதலில் அமாந்த அல்லது பூர்ணிமாந்த என்பதை அமைப்புகளில் தேர்ந்தெடுக்கவும்.', 'கணக்கிட அல்லது சேமிக்க இயலவில்லை. மீண்டும் முயலவும்.', 'இந்த ஆண்டில் பொருந்தும் உதயம் இல்லை.', 'வரவிருக்கும் தேதிகள்'],
  te: ['నా తిథులు', 'ఆంగ్ల తేదీని ఎంచుకోండి. ప్రస్తుత అమాంత లేదా పూర్ణిమాంత అమరిక ప్రకారం మాసం, తిథి భద్రపరచబడతాయి. తర్వాత అమరిక మార్చినా నియమం మారదు. భద్రపరిచిన ప్రదేశంలో మొదటి సూర్యోదయం వాడబడుతుంది; క్షయ తిథికి ఆ సంవత్సరం గుర్తుచేయడం ఉండకపోవచ్చు.', 'ఆచరణ పేరు', 'ఆంగ్ల తేదీ', 'తిథి చూడండి', 'తిథి భద్రపరచండి', 'తొలగించు', 'ఈ పరికరంలో మాత్రమే భద్రపరచబడుతుంది. బ్రౌజర్ డేటా తొలగిస్తే నమోదులు పోతాయి.', 'ముందుగా అమాంత లేదా పూర్ణిమాంత ఎంచుకోండి.', 'గణన లేదా భద్రపరచడం విఫలం. మళ్లీ ప్రయత్నించండి.', 'ఈ సంవత్సరంలో సరిపోలే సూర్యోదయం లేదు.', 'రాబోయే తేదీలు'],
  kn: ['ನನ್ನ ತಿಥಿಗಳು', 'ಇಂಗ್ಲಿಷ್ ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ. ಪ್ರಸ್ತುತ ಅಮಾಂತ ಅಥವಾ ಪೂರ್ಣಿಮಾಂತ ಆಯ್ಕೆಯಂತೆ ಮಾಸ ಮತ್ತು ತಿಥಿ ಉಳಿಯುತ್ತವೆ. ನಂತರ ಆಯ್ಕೆ ಬದಲಿಸಿದರೂ ನಿಯಮ ಬದಲಾಗದು. ಉಳಿಸಿದ ಸ್ಥಳದ ಮೊದಲ ಸೂರ್ಯೋದಯ ಬಳಸಲಾಗುತ್ತದೆ; ಕ್ಷಯ ತಿಥಿಗೆ ಆ ವರ್ಷ ಜ್ಞಾಪನೆ ಇರದಿರಬಹುದು.', 'ಆಚರಣೆಯ ಹೆಸರು', 'ಇಂಗ್ಲಿಷ್ ದಿನಾಂಕ', 'ತಿಥಿ ನೋಡಿ', 'ತಿಥಿ ಉಳಿಸಿ', 'ಅಳಿಸಿ', 'ಈ ಸಾಧನದಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತದೆ. ಬ್ರೌಸರ್ ಡೇಟಾ ಅಳಿಸಿದರೆ ದಾಖಲೆಗಳು ಹೋಗುತ್ತವೆ.', 'ಮೊದಲು ಅಮಾಂತ ಅಥವಾ ಪೂರ್ಣಿಮಾಂತ ಆಯ್ಕೆಮಾಡಿ.', 'ಲೆಕ್ಕ ಅಥವಾ ಉಳಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', 'ಈ ವರ್ಷ ಹೊಂದುವ ಸೂರ್ಯೋದಯ ಇಲ್ಲ.', 'ಮುಂಬರುವ ದಿನಾಂಕಗಳು'],
  ml: ['എന്റെ തിഥികൾ', 'ഇംഗ്ലീഷ് തീയതി തിരഞ്ഞെടുക്കുക. നിലവിലെ അമാന്ത അല്ലെങ്കിൽ പൂർണിമാന്ത ക്രമീകരണമനുസരിച്ച് മാസവും തിഥിയും സൂക്ഷിക്കും. പിന്നീട് ക്രമീകരണം മാറ്റിയാലും നിയമം മാറില്ല. സൂക്ഷിച്ച സ്ഥലത്തെ ആദ്യ സൂര്യോദയം ഉപയോഗിക്കുന്നു; ക്ഷയ തിഥിക്ക് ആ വർഷം ഓർമ്മപ്പെടുത്തൽ ഇല്ലാതിരിക്കാം.', 'ആചരണത്തിന്റെ പേര്', 'ഇംഗ്ലീഷ് തീയതി', 'തിഥി കാണുക', 'തിഥി സൂക്ഷിക്കുക', 'നീക്കം ചെയ്യുക', 'ഈ ഉപകരണത്തിൽ മാത്രം സൂക്ഷിക്കുന്നു. ബ്രൗസർ ഡാറ്റ മായ്ച്ചാൽ രേഖകൾ നഷ്ടപ്പെടും.', 'ആദ്യം അമാന്ത അല്ലെങ്കിൽ പൂർണിമാന്ത തിരഞ്ഞെടുക്കുക.', 'കണക്കാക്കാനോ സൂക്ഷിക്കാനോ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.', 'ഈ വർഷം പൊരുത്തപ്പെടുന്ന സൂര്യോദയം ഇല്ല.', 'വരുന്ന തീയതികൾ'],
  gu: ['મારી તિથિઓ', 'અંગ્રેજી તારીખ પસંદ કરો. હાલની અમાન્ત કે પૂર્ણિમાન્ત સેટિંગ પ્રમાણે માસ અને તિથિ સચવાશે. પછી સેટિંગ બદલવાથી નિયમ બદલાતો નથી. સાચવેલા સ્થળનો પ્રથમ સૂર્યોદય વપરાય છે; ક્ષય તિથિનું સ્મરણ તે વર્ષે ન પણ મળે.', 'પ્રસંગનું નામ', 'અંગ્રેજી તારીખ', 'તિથિ જુઓ', 'તિથિ સાચવો', 'કાઢો', 'માત્ર આ ઉપકરણમાં સચવાય છે. બ્રાઉઝર ડેટા સાફ કરવાથી નોંધો દૂર થશે.', 'પહેલા અમાન્ત કે પૂર્ણિમાન્ત પસંદ કરો.', 'ગણતરી કે સાચવવું નિષ્ફળ. ફરી પ્રયાસ કરો.', 'આ વર્ષે મળતો સૂર્યોદય નથી.', 'આગામી તારીખો'],
  bn: ['আমার তিথি', 'ইংরেজি তারিখ বেছে নিন। বর্তমান অমান্ত বা পূর্ণিমান্ত সেটিং অনুযায়ী মাস ও তিথি সংরক্ষিত হবে। পরে সেটিং বদলালেও নিয়ম বদলাবে না। সংরক্ষিত স্থানের প্রথম সূর্যোদয় ধরা হয়; ক্ষয় তিথিতে সে বছর স্মরণ নাও আসতে পারে।', 'অনুষ্ঠানের নাম', 'ইংরেজি তারিখ', 'তিথি দেখুন', 'তিথি সংরক্ষণ', 'মুছুন', 'শুধু এই যন্ত্রে সংরক্ষিত। ব্রাউজার ডেটা মুছলে রেকর্ড হারাবে।', 'আগে অমান্ত বা পূর্ণিমান্ত বেছে নিন।', 'গণনা বা সংরক্ষণ ব্যর্থ। আবার চেষ্টা করুন।', 'এই বছরে মেলা সূর্যোদয় নেই।', 'আসন্ন তারিখগুলি'],
  pa: ['ਮੇਰੀਆਂ ਤਿਥੀਆਂ', 'ਅੰਗਰੇਜ਼ੀ ਤਾਰੀਖ ਚੁਣੋ। ਮੌਜੂਦਾ ਅਮਾਂਤ ਜਾਂ ਪੂਰਨਿਮਾਂਤ ਸੈਟਿੰਗ ਮੁਤਾਬਕ ਮਹੀਨਾ ਤੇ ਤਿਥੀ ਸੰਭਾਲੇ ਜਾਣਗੇ। ਬਾਅਦ ਵਿੱਚ ਸੈਟਿੰਗ ਬਦਲਣ ਨਾਲ ਨਿਯਮ ਨਹੀਂ ਬਦਲੇਗਾ। ਸੰਭਾਲੇ ਸਥਾਨ ਦਾ ਪਹਿਲਾ ਸੂਰਜ ਚੜ੍ਹਨਾ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ; ਘਟੀ ਤਿਥੀ ਲਈ ਉਸ ਸਾਲ ਯਾਦ ਨਾ ਆਵੇ।', 'ਮੌਕੇ ਦਾ ਨਾਮ', 'ਅੰਗਰੇਜ਼ੀ ਤਾਰੀਖ', 'ਤਿਥੀ ਵੇਖੋ', 'ਤਿਥੀ ਸੰਭਾਲੋ', 'ਮਿਟਾਓ', 'ਸਿਰਫ਼ ਇਸ ਜੰਤਰ ਤੇ ਸੰਭਾਲਿਆ ਜਾਂਦਾ ਹੈ। ਬ੍ਰਾਊਜ਼ਰ ਡਾਟਾ ਮਿਟਾਉਣ ਨਾਲ ਰਿਕਾਰਡ ਹਟਣਗੇ।', 'ਪਹਿਲਾਂ ਅਮਾਂਤ ਜਾਂ ਪੂਰਨਿਮਾਂਤ ਚੁਣੋ।', 'ਗਣਨਾ ਜਾਂ ਸੰਭਾਲਣਾ ਅਸਫਲ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', 'ਇਸ ਸਾਲ ਮਿਲਦਾ ਸੂਰਜ ਚੜ੍ਹਨਾ ਨਹੀਂ।', 'ਆਉਣ ਵਾਲੀਆਂ ਤਾਰੀਖਾਂ'],
}
export function personalCopy(language: string) { return COPY[language as LanguageCode] ?? COPY.en }

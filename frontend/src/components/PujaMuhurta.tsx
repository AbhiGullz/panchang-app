import { useTranslation } from 'react-i18next'
import { festivalBasis } from '../lib/festival-basis'
import { formatDisplayDate, formatTimeWithTimezone } from '../lib/utils'
import type { FestivalItem } from '../types/api'

const COPY: Record<string, [string, string]> = {
  en: ['Festival puja timings', 'No matching local ritual window was found.'],
  hi: ['पर्व पूजा मुहूर्त', 'स्थानीय पूजा अवधि का मेल नहीं मिला।'],
  mr: ['सणांचे पूजा मुहूर्त', 'जुळणारा स्थानिक पूजाकाळ सापडला नाही.'],
  ta: ['விழா வழிபாட்டு நேரங்கள்', 'பொருந்தும் உள்ளூர் வழிபாட்டு நேரம் கிடைக்கவில்லை.'],
  te: ['పండుగ పూజా సమయాలు', 'సరిపోలే స్థానిక పూజా సమయం లేదు.'],
  kn: ['ಹಬ್ಬದ ಪೂಜಾ ಸಮಯಗಳು', 'ಹೊಂದುವ ಸ್ಥಳೀಯ ಪೂಜಾ ಸಮಯ ಸಿಗಲಿಲ್ಲ.'],
  ml: ['ഉത്സവ പൂജാസമയങ്ങൾ', 'പൊരുത്തപ്പെടുന്ന പ്രാദേശിക പൂജാസമയം ലഭ്യമല്ല.'],
  gu: ['તહેવારના પૂજા મુહૂર્ત', 'મેળ ખાતો સ્થાનિક પૂજાકાળ મળ્યો નથી.'],
  bn: ['উৎসবের পূজার সময়', 'মিল থাকা স্থানীয় পূজার সময় পাওয়া যায়নি।'],
  pa: ['ਤਿਉਹਾਰਾਂ ਦੇ ਪੂਜਾ ਸਮੇਂ', 'ਮੇਲ ਖਾਂਦਾ ਸਥਾਨਕ ਪੂਜਾ ਸਮਾਂ ਨਹੀਂ ਮਿਲਿਆ।'],
}

function pujaName(item: FestivalItem, language: string) {
  if (language === 'en') {
    if (item.id === 'dhanteras') return 'Dhanteras Puja'
    if (item.id === 'diwali') return 'Diwali Lakshmi Puja'
    if (item.id === 'naraka') return 'Roop / Narak Chaturdashi — Abhyang Snan'
  }
  if (language === 'hi' && item.id === 'naraka') return 'रूप / नरक चतुर्दशी — अभ्यंग स्नान'
  if (language === 'hi' && item.id === 'diwali') return 'दीपावली लक्ष्मी पूजा'
  return item.localized_name ?? item.name
}

export function PujaWindow({ item, timezone }: { item: FestivalItem; timezone: string }) {
  const { i18n } = useTranslation()
  if (!item.ritual_window) return null
  const language = i18n.language.split('-')[0] ?? 'en'
  const start = item.observance_start, end = item.observance_end
  if (!start || !end || !(Date.parse(start) < Date.parse(end))) {
    return <p className="mt-1 text-xs text-slate-600">{(COPY[language] ?? COPY.en!)[1]}</p>
  }
  const endpoint = (value: string) => `${value.slice(0, 10) !== item.date ? `${formatDisplayDate(value, language)}, ` : ''}${formatTimeWithTimezone(value, timezone, item.date, language)}`
  return <p className="mt-1 text-sm font-medium text-sky-900"><time dateTime={start}>{endpoint(start)}</time> — <time dateTime={end}>{endpoint(end)}</time></p>
}

export function PujaMuhurta({ festivals, timezone }: { festivals: FestivalItem[]; timezone: string }) {
  const { i18n } = useTranslation()
  const language = i18n.language.split('-')[0] ?? 'en'
  const items = festivals.filter(item => item.ritual_window)
  if (!items.length) return null
  return <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100">
    <h2 className="text-lg font-semibold">{(COPY[language] ?? COPY.en!)[0]}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{items.map(item => <article key={`${item.id ?? item.name}-${item.date}`} className="rounded-2xl border border-sky-100 p-4">
      <h3 className="font-semibold">{pujaName(item, language)}</h3>
      <p className="text-sm text-slate-600">{formatDisplayDate(item.date, language)}</p>
      <PujaWindow item={item} timezone={timezone} />
      {festivalBasis(item, language) && <p className="mt-1 text-xs text-slate-500">{festivalBasis(item, language)}</p>}
    </article>)}</div>
  </section>
}

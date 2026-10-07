import { useMemo, useRef, useState } from 'react'
import { Download, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LanguageCode, PanchangResponse } from '../types/api'
import { formatDisplayDate, formatWeekday } from '../lib/utils'

interface Props {
  data?: PanchangResponse
  selectedDate: string
  locationName: string
}

type FormState = {
  name: string
  father: string
  mother: string
  spouse: string
  children: string
  gotra: string
  address: string
  ritual: string
  deity: string
  purpose: string
  duration: string
  count: string
  otherRitual: string
  otherPurpose: string
  otherDeity: string
  otherDuration: string
}

const emptyForm: FormState = {
  name: '', father: '', mother: '', spouse: '', children: '', gotra: '', address: '',
  ritual: 'daily-puja', deity: 'ishta-devata', purpose: 'devotion', duration: 'one-day', count: '',
  otherRitual: '', otherPurpose: '', otherDeity: '', otherDuration: '',
}

const ritualGroups = [
  { label: 'Worship', options: [
    ['daily-puja', 'Daily pūjā', 'दैनिकपूजां'], ['festival-puja', 'Festival pūjā', 'उत्सवपूजां'],
    ['deity-puja', 'Deity pūjā', 'देवतापूजां'], ['abhisheka', 'Abhiṣeka', 'अभिषेकं'], ['archana', 'Arcanā', 'अर्चनां'],
    ['satyanarayana', 'Satyanārāyaṇa pūjā', 'सत्यनारायणपूजां'], ['rudrabhisheka', 'Rudrābhiṣeka', 'रुद्राभिषेकं'],
    ['navagraha', 'Navagraha pūjā', 'नवग्रहपूजां'],
  ]},
  { label: 'Spiritual practice', options: [
    ['sadhana', 'Sādhana', 'साधनां'], ['mantra-japa', 'Mantra japa', 'मन्त्रजपं'], ['stotra', 'Stotra / sacred reading', 'स्तोत्रपाठं'],
    ['dhyana', 'Dhyāna / meditation', 'ध्यानसाधनां'], ['anushthana', 'Anuṣṭhāna', 'अनुष्ठानं'],
    ['vrata', 'Vrata / fast', 'व्रतं'], ['parayana', 'Pārāyaṇa', 'पारायणं'],
  ]},
  { label: 'Fire rites and offerings', options: [
    ['homa', 'Homa / Havan', 'होमं'], ['yajna', 'Yajña', 'यज्ञं'], ['dana', 'Dāna / charity', 'दानकर्म'],
    ['tarpana', 'Tarpaṇa', 'तर्पणकर्म'], ['ancestor', 'Ancestor remembrance', 'पितृस्मरणकर्म'],
  ]},
  { label: 'Life events', options: [
    ['birthday', 'Birthday / Āyuṣya', 'आयुष्यपूजां'], ['marriage', 'Marriage', 'विवाहसम्बन्धिपूजां'],
    ['griha-pravesha', 'Gṛha Praveśa', 'गृहप्रवेशपूजां'], ['bhoomi-puja', 'Bhūmi pūjā', 'भूमिपूजां'],
    ['naming', 'Naming ceremony', 'नामकरणसंस्कारं'], ['annaprashana', 'Annaprāśana', 'अन्नप्राशनसंस्कारं'],
    ['vidyarambha', 'Vidyārambha', 'विद्यारम्भसंस्कारं'], ['vehicle', 'Vehicle pūjā', 'वाहनपूजां'],
    ['new-venture', 'New work or business', 'नवीनकार्यपूजां'], ['journey', 'Journey / pilgrimage', 'यात्रासंकल्पं'],
  ]},
  { label: 'Custom', options: [['other', 'Other (write your own)', 'संकल्पितकर्म']] },
] as const

const deities = [
  ['ishta-devata', 'Iṣṭa-devatā / chosen deity', 'इष्टदेवता'], ['ganesha', 'Śrī Gaṇeśa', 'श्रीगणेश'],
  ['shiva', 'Śiva', 'शिव'], ['vishnu', 'Viṣṇu', 'विष्णु'], ['devi', 'Devī', 'देवी'], ['lakshmi', 'Lakṣmī', 'लक्ष्मी'],
  ['saraswati', 'Sarasvatī', 'सरस्वती'], ['durga', 'Durgā', 'दुर्गा'], ['hanuman', 'Hanumān', 'हनुमान'],
  ['rama', 'Rāma', 'राम'], ['krishna', 'Kṛṣṇa', 'कृष्ण'], ['surya', 'Sūrya', 'सूर्य'],
  ['navagraha', 'Navagraha', 'नवग्रह'], ['other', 'Other', 'अन्यदेवता'],
] as const

const purposes = [
  ['devotion', 'Devotion and divine grace', 'भगवत्प्रीत्यर्थं'], ['health', 'Health and recovery', 'आरोग्यसिद्ध्यर्थं'],
  ['family', 'Family welfare', 'सकुटुम्बक्षेमस्थैर्यसिद्ध्यर्थं'], ['prosperity', 'Prosperity', 'धनधान्यसमृद्ध्यर्थं'],
  ['education', 'Education and knowledge', 'विद्याप्राप्त्यर्थं'], ['career', 'Career and work', 'कार्यसिद्ध्यर्थं'],
  ['marriage', 'Marriage wish', 'विवाहप्राप्त्यर्थं'], ['children', 'Children / progeny', 'सन्तानप्राप्त्यर्थं'],
  ['peace', 'Peace of mind', 'मनःशान्त्यर्थं'], ['obstacles', 'Removal of obstacles', 'सर्वविघ्ननिवारणार्थं'],
  ['protection', 'Protection', 'रक्षासिद्ध्यर्थं'], ['spiritual', 'Spiritual growth', 'आत्मिकउन्नत्यर्थं'],
  ['fulfillment', 'Fulfilment of a wish', 'अभीष्टसिद्ध्यर्थं'], ['gratitude', 'Gratitude', 'कृतज्ञताप्रकाशनार्थं'],
  ['world-welfare', 'Welfare of all beings', 'सर्वलोककल्याणार्थं'], ['other', 'Other (write your own)', 'अभीष्टप्रयोजनसिद्ध्यर्थं'],
] as const

const durations = [
  ['one-day', 'One day', 'एकदिनपर्यन्तम्'], ['three-days', '3 days', 'त्रिदिनपर्यन्तम्'], ['seven-days', '7 days', 'सप्तदिनपर्यन्तम्'], ['nine-days', '9 days', 'नवदिनपर्यन्तम्'],
  ['eleven-days', '11 days', 'एकादशदिनपर्यन्तम्'], ['twenty-one-days', '21 days', 'एकविंशतिदिनपर्यन्तम्'], ['forty-days', '40 days', 'चत्वारिंशद्दिनपर्यन्तम्'],
  ['forty-eight-days', '48 days / maṇḍala', 'अष्टचत्वारिंशद्दिनपर्यन्तम्'], ['custom', 'Custom duration', 'निर्दिष्टकालपर्यन्तम्'],
] as const

const sanskritWeekdays = ['रविवासरे', 'सोमवासरे', 'मङ्गलवासरे', 'बुधवासरे', 'गुरुवासरे', 'शुक्रवासरे', 'शनिवासरे']

function localized(value: string | Record<string, string> | undefined, language: string) {
  if (!value) return '—'
  return typeof value === 'string' ? value : value[language] ?? value.en ?? '—'
}

function optionValue(groups: typeof ritualGroups, selected: string, position: 1 | 2) {
  for (const group of groups) {
    const match = group.options.find((item) => item[0] === selected)
    if (match) return match[position]
  }
  return selected
}

function simpleOptionValue(options: ReadonlyArray<readonly string[]>, selected: string, position: number) {
  return options.find((item) => item[0] === selected)?.[position] ?? selected
}

function selectedLanguageText(language: LanguageCode, values: Record<string, string>) {
  const lines: Record<LanguageCode, string> = {
    en: `On ${values.date}, at ${values.location}, I, ${values.name} of ${values.gotra} gotra, undertake ${values.ritual} dedicated to ${values.deity} for ${values.purpose}. The Panchang is ${values.weekday}, ${values.month} month, ${values.paksha} Paksha, ${values.tithi} Tithi and ${values.nakshatra} Nakshatra.`,
    hi: `${values.date} को ${values.location} में, मैं ${values.name}, ${values.gotra} गोत्र, ${values.deity} को समर्पित ${values.ritual}, ${values.purpose} के लिए करने का संकल्प करता/करती हूँ। पंचांग: ${values.weekday}, ${values.month} मास, ${values.paksha} पक्ष, ${values.tithi} तिथि और ${values.nakshatra} नक्षत्र।`,
    mr: `${values.date} रोजी ${values.location} येथे, मी ${values.name}, ${values.gotra} गोत्र, ${values.deity} यांना समर्पित ${values.ritual}, ${values.purpose} यासाठी करण्याचा संकल्प करतो/करते. पंचांग: ${values.weekday}, ${values.month} मास, ${values.paksha} पक्ष, ${values.tithi} तिथी आणि ${values.nakshatra} नक्षत्र.`,
    ta: `${values.date} அன்று ${values.location} இல், ${values.gotra} கோத்திரத்தைச் சேர்ந்த நான் ${values.name}, ${values.deity} அர்ப்பணிப்பாக ${values.purpose} நோக்கத்திற்காக ${values.ritual} செய்ய உறுதி செய்கிறேன். பஞ்சாங்கம்: ${values.weekday}, ${values.month} மாதம், ${values.paksha} பக்ஷம், ${values.tithi} திதி, ${values.nakshatra} நட்சத்திரம்.`,
    te: `${values.date} న ${values.location} లో, ${values.gotra} గోత్రానికి చెందిన నేను ${values.name}, ${values.deity} కు అంకితంగా ${values.purpose} కోసం ${values.ritual} చేయాలని సంకల్పిస్తున్నాను. పంచాంగం: ${values.weekday}, ${values.month} మాసం, ${values.paksha} పక్షం, ${values.tithi} తిథి, ${values.nakshatra} నక్షత్రం.`,
    kn: `${values.date} ರಂದು ${values.location} ನಲ್ಲಿ, ${values.gotra} ಗೋತ್ರದ ನಾನು ${values.name}, ${values.deity} ಗೆ ಸಮರ್ಪಿತವಾಗಿ ${values.purpose} ಗಾಗಿ ${values.ritual} ಮಾಡುವ ಸಂಕಲ್ಪ ಮಾಡುತ್ತೇನೆ. ಪಂಚಾಂಗ: ${values.weekday}, ${values.month} ಮಾಸ, ${values.paksha} ಪಕ್ಷ, ${values.tithi} ತಿಥಿ ಮತ್ತು ${values.nakshatra} ನಕ್ಷತ್ರ.`,
    ml: `${values.date} ന് ${values.location} ൽ, ${values.gotra} ഗോത്രത്തിൽപ്പെട്ട ഞാൻ ${values.name}, ${values.deity} ക്ക് സമർപ്പിച്ച് ${values.purpose} നായി ${values.ritual} നടത്തുമെന്ന് സങ്കൽപ്പിക്കുന്നു. പഞ്ചാംഗം: ${values.weekday}, ${values.month} മാസം, ${values.paksha} പക്ഷം, ${values.tithi} തിഥി, ${values.nakshatra} നക്ഷത്രം.`,
    gu: `${values.date} ના રોજ ${values.location} ખાતે, હું ${values.name}, ${values.gotra} ગોત્ર, ${values.deity} ને સમર્પિત ${values.ritual}, ${values.purpose} માટે કરવાનો સંકલ્પ કરું છું. પંચાંગ: ${values.weekday}, ${values.month} માસ, ${values.paksha} પક્ષ, ${values.tithi} તિથિ અને ${values.nakshatra} નક્ષત્ર.`,
    bn: `${values.date} তারিখে ${values.location}-এ, আমি ${values.name}, ${values.gotra} গোত্র, ${values.deity}-কে নিবেদিত ${values.ritual}, ${values.purpose}-এর জন্য করার সংকল্প করছি। পঞ্জিকা: ${values.weekday}, ${values.month} মাস, ${values.paksha} পক্ষ, ${values.tithi} তিথি এবং ${values.nakshatra} নক্ষত্র।`,
    pa: `${values.date} ਨੂੰ ${values.location} ਵਿਖੇ, ਮੈਂ ${values.name}, ${values.gotra} ਗੋਤ, ${values.deity} ਨੂੰ ਸਮਰਪਿਤ ${values.ritual}, ${values.purpose} ਲਈ ਕਰਨ ਦਾ ਸੰਕਲਪ ਕਰਦਾ/ਕਰਦੀ ਹਾਂ। ਪੰਚਾਂਗ: ${values.weekday}, ${values.month} ਮਾਸ, ${values.paksha} ਪੱਖ, ${values.tithi} ਤਿਥੀ ਅਤੇ ${values.nakshatra} ਨਕਸ਼ਤਰ।`,
  }
  return lines[language]
}

export function SankalpaTab({ data, selectedDate, locationName }: Props) {
  const { i18n, t } = useTranslation()
  const language = (i18n.language.split('-')[0] || 'en') as LanguageCode
  const [form, setForm] = useState<FormState>(emptyForm)
  const [downloading, setDownloading] = useState(false)
  const documentRef = useRef<HTMLDivElement>(null)
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const generated = useMemo(() => {
    if (!data) return null
    const ritualLabel = form.ritual === 'other' && form.otherRitual ? form.otherRitual : optionValue(ritualGroups, form.ritual, 1)
    const ritualSanskrit = form.ritual === 'other' && form.otherRitual ? form.otherRitual : optionValue(ritualGroups, form.ritual, 2)
    const purposeLabel = form.purpose === 'other' && form.otherPurpose ? form.otherPurpose : simpleOptionValue(purposes, form.purpose, 1)
    const purposeSanskrit = form.purpose === 'other' && form.otherPurpose ? `अभीष्टप्रयोजनसिद्ध्यर्थं (${form.otherPurpose})` : simpleOptionValue(purposes, form.purpose, 2)
    const deityLabel = form.deity === 'other' && form.otherDeity ? form.otherDeity : simpleOptionValue(deities, form.deity, 1)
    const deitySanskrit = form.deity === 'other' && form.otherDeity ? form.otherDeity : simpleOptionValue(deities, form.deity, 2)
    const dateObject = new Date(`${selectedDate}T12:00:00`)
    const familySanskrit = [form.father && `पितृनाम ${form.father}`, form.mother && `मातृनाम ${form.mother}`, form.spouse && `जीवनसाथिनाम ${form.spouse}`, form.children && `सन्ताननाम ${form.children}`].filter(Boolean).join(', ')
    const practiceSanskrit = [form.count && `${form.count} आवृत्तिपरिमाणेन`, form.duration === 'custom' && form.otherDuration ? `${form.otherDuration} कालपर्यन्तम्` : simpleOptionValue(durations, form.duration, 2)].filter(Boolean).join(' ')
    const location = form.address || locationName
    const sanskrit = `ॐ विष्णुर्विष्णुर्विष्णुः। अद्य ${location} स्थाने, ${localized(data.month_name, 'hi')} मासे, ${data.paksha === 'krishna' ? 'कृष्ण' : 'शुक्ल'} पक्षे, ${localized(data.tithi.name, 'hi')} तिथौ, ${sanskritWeekdays[dateObject.getDay()]}, ${localized(data.nakshatra.name, 'hi')} नक्षत्रे, ${form.gotra || 'अमुक'} गोत्रस्य ${form.name || 'अमुक'} नामधेयस्य ${familySanskrit ? `(${familySanskrit}) ` : ''}मम सकुटुम्बस्य क्षेम-स्थैर्य-आयुरारोग्य-ऐश्वर्याभिवृद्ध्यर्थं, ${purposeSanskrit}, ${deitySanskrit} प्रीत्यर्थं ${practiceSanskrit} ${ritualSanskrit} करिष्ये।`
    const values = {
      date: formatDisplayDate(selectedDate, language), location,
      name: form.name || '________', gotra: form.gotra || '________', ritual: ritualLabel,
      deity: deityLabel, purpose: purposeLabel, weekday: formatWeekday(selectedDate, language),
      month: localized(data.month_name, language), paksha: data.paksha ?? '—',
      tithi: localized(data.tithi.name, language), nakshatra: localized(data.nakshatra.name, language),
    }
    const family = [form.father && `Father: ${form.father}`, form.mother && `Mother: ${form.mother}`, form.spouse && `Spouse: ${form.spouse}`, form.children && `Children: ${form.children}`].filter(Boolean).join(' · ')
    const durationLabel = form.duration === 'custom' ? form.otherDuration : simpleOptionValue(durations, form.duration, 1)
    const practice = [durationLabel && `Duration: ${durationLabel}`, form.count && `Repetitions: ${form.count}`].filter(Boolean).join(' · ')
    return { sanskrit, translated: selectedLanguageText(language, values), family, practice, address: form.address }
  }, [data, form, language, locationName, selectedDate])

  const downloadPdf = async () => {
    if (!documentRef.current || !generated) return
    setDownloading(true)
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')])
      const element = documentRef.current
      const image = await toPng(element, { backgroundColor: '#ffffff', cacheBust: true, pixelRatio: 2 })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const width = 190
      const height = element.scrollHeight * width / element.scrollWidth
      let offset = 10
      let remaining = height
      pdf.addImage(image, 'PNG', 10, offset, width, height)
      remaining -= 277
      while (remaining > 0) {
        offset -= 277
        pdf.addPage()
        pdf.addImage(image, 'PNG', 10, offset, width, height)
        remaining -= 277
      }
      const blobUrl = URL.createObjectURL(pdf.output('blob'))
      const download = document.createElement('a')
      download.href = blobUrl
      download.download = `gajaa-sankalpa-${selectedDate}.pdf`
      document.body.appendChild(download)
      download.click()
      download.remove()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      setForm(emptyForm)
    } finally {
      setDownloading(false)
    }
  }

  if (!data) return <div className="rounded-3xl border border-[#D7E7F0] bg-white p-6 text-sm text-slate-500">{t('loading')}</div>

  const inputClass = 'mt-1 w-full rounded-xl border border-[#D7E7F0] bg-[#F5FAFD] px-3 py-2 text-sm'
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-[#D7E7F0] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">{t('sankalpa')}</h2>
        <div className="mt-3 flex gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900"><ShieldCheck className="h-5 w-5 shrink-0" /><p>No personal information is stored or sent to the server. This form clears when you leave this tab or after downloading the PDF. Download your Sankalpa before switching tabs.</p></div>
        <p className="mt-3 text-xs text-slate-500">This is a general devotional template. Regional, family and sampradāya wording varies; consult your family priest or guru for rites requiring a prescribed paddhati.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">Sankalpa type<select className={inputClass} value={form.ritual} onChange={(event) => update('ritual', event.target.value)}>{ritualGroups.map((group) => <optgroup key={group.label} label={group.label}>{group.options.map((option) => <option key={option[0]} value={option[0]}>{option[1]}</option>)}</optgroup>)}</select></label>
          <label className="text-sm font-medium">Purpose<select className={inputClass} value={form.purpose} onChange={(event) => update('purpose', event.target.value)}>{purposes.map((option) => <option key={option[0]} value={option[0]}>{option[1]}</option>)}</select></label>
          {form.ritual === 'other' ? <label className="text-sm font-medium">Describe the rite<input className={inputClass} value={form.otherRitual} onChange={(event) => update('otherRitual', event.target.value)} /></label> : null}
          {form.purpose === 'other' ? <label className="text-sm font-medium">Write your purpose<input className={inputClass} value={form.otherPurpose} onChange={(event) => update('otherPurpose', event.target.value)} /></label> : null}
          <label className="text-sm font-medium">Deity or focus<select className={inputClass} value={form.deity} onChange={(event) => update('deity', event.target.value)}>{deities.map((option) => <option key={option[0]} value={option[0]}>{option[1]}</option>)}</select></label>
          <label className="text-sm font-medium">Duration<select className={inputClass} value={form.duration} onChange={(event) => update('duration', event.target.value)}>{durations.map((option) => <option key={option[0]} value={option[0]}>{option[1]}</option>)}</select></label>
          {form.deity === 'other' ? <label className="text-sm font-medium">Name the deity or focus<input className={inputClass} value={form.otherDeity} onChange={(event) => update('otherDeity', event.target.value)} /></label> : null}
          {form.duration === 'custom' ? <label className="text-sm font-medium">Custom duration<input className={inputClass} value={form.otherDuration} onChange={(event) => update('otherDuration', event.target.value)} /></label> : null}
          <label className="text-sm font-medium">Japa / recitation count (optional)<input className={inputClass} inputMode="numeric" value={form.count} onChange={(event) => update('count', event.target.value)} /></label>
          <label className="text-sm font-medium">Your name<input className={inputClass} value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
          <label className="text-sm font-medium">Gotra<input className={inputClass} value={form.gotra} onChange={(event) => update('gotra', event.target.value)} /></label>
          <label className="text-sm font-medium">Father's name<input className={inputClass} value={form.father} onChange={(event) => update('father', event.target.value)} /></label>
          <label className="text-sm font-medium">Mother's name<input className={inputClass} value={form.mother} onChange={(event) => update('mother', event.target.value)} /></label>
          <label className="text-sm font-medium">Spouse's name<input className={inputClass} value={form.spouse} onChange={(event) => update('spouse', event.target.value)} /></label>
          <label className="text-sm font-medium">Children's names<input className={inputClass} value={form.children} onChange={(event) => update('children', event.target.value)} /></label>
          <label className="text-sm font-medium sm:col-span-2">Complete address<textarea className={inputClass} rows={3} value={form.address} onChange={(event) => update('address', event.target.value)} /></label>
        </div>
      </div>

      {generated ? <div ref={documentRef} className="rounded-3xl border border-[#D7E7F0] bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-3"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#163B63]">Gajaa Panchang</div><h3 className="mt-1 text-xl font-semibold">Sankalpa · {formatDisplayDate(selectedDate, language)}</h3><p className="text-sm text-slate-500">{locationName}</p></div>
        <h4 className="mt-5 font-semibold">संस्कृत संकल्प</h4><p className="mt-2 whitespace-pre-line text-lg leading-9">{generated.sanskrit}</p>
        <h4 className="mt-6 font-semibold">{t('sankalpaInSelectedLanguage')}</h4><p className="mt-2 leading-7 text-slate-700">{generated.translated}</p>
        {generated.family ? <p className="mt-4 text-sm text-slate-600">{generated.family}</p> : null}
        {generated.practice ? <p className="mt-2 text-sm text-slate-600">{generated.practice}</p> : null}
        {generated.address ? <p className="mt-2 text-sm text-slate-600">Address: {generated.address}</p> : null}
        <p className="mt-6 border-t border-slate-200 pt-3 text-xs text-slate-500">Generated privately on this device. Personal information was not uploaded or stored.</p>
      </div> : null}
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#163B63] px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={downloading} onClick={downloadPdf} type="button"><Download className="h-5 w-5" />{downloading ? 'Preparing PDF…' : 'Download PDF and clear personal information'}</button>
    </section>
  )
}

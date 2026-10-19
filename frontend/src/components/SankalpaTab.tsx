import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LanguageCode, PanchangResponse } from '../types/api'
import { formatDisplayDate, formatWeekday } from '../lib/utils'
import { FieldHelp } from './FieldHelp'
import { sankalpaOption, sankalpaSentence, participation, inputGuidance, addressText, genderText, fieldHelp } from '../lib/sankalpa-locales'
import { sankalpaScript, sanskritDuration } from '../lib/sankalpa-script'

interface Props {
  data?: PanchangResponse
  selectedDate: string
  locationName: string
}

type FormState = {
  gender: string
  name: string
  father: string
  mother: string
  spouse: string
  children: string
  gotra: string
  address: string
  temporaryAddress: string
  ritual: string
  deity: string
  purpose: string
  duration: string
  count: string
  otherRitual: string
  otherPurpose: string
  otherDeity: string
  otherDuration: string
  participation: string
}

const emptyForm: FormState = {
  gender: 'neutral', name: '', father: '', mother: '', spouse: '', children: '', gotra: '', address: '', temporaryAddress: '',
  ritual: 'daily-puja', deity: 'ishta-devata', purpose: 'devotion', duration: 'one-day', count: '',
  otherRitual: '', otherPurpose: '', otherDeity: '', otherDuration: '', participation: 'family',
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

const pakshaNames: Record<LanguageCode, { shukla: string; krishna: string }> = {
  en: { shukla: 'Shukla', krishna: 'Krishna' }, hi: { shukla: 'शुक्ल', krishna: 'कृष्ण' }, mr: { shukla: 'शुक्ल', krishna: 'कृष्ण' },
  ta: { shukla: 'சுக்ல', krishna: 'கிருஷ்ண' }, te: { shukla: 'శుక్ల', krishna: 'కృష్ణ' }, kn: { shukla: 'ಶುಕ್ಲ', krishna: 'ಕೃಷ್ಣ' },
  ml: { shukla: 'ശുക്ല', krishna: 'കൃഷ്ണ' }, gu: { shukla: 'શુક્લ', krishna: 'કૃષ્ણ' }, bn: { shukla: 'শুক্ল', krishna: 'কৃষ্ণ' }, pa: { shukla: 'ਸ਼ੁਕਲ', krishna: 'ਕ੍ਰਿਸ਼ਨ' },
}

const sanskritPlaceNames: Record<string, string> = {
  flemington: 'फ्लेमिंग्टन', 'new jersey': 'न्यू जर्सी', 'united states': 'संयुक्त राज्य अमेरिका', usa: 'संयुक्त राज्य अमेरिका', america: 'अमेरिका',
  pune: 'पुणे', maharashtra: 'महाराष्ट्र', india: 'भारत', austin: 'ऑस्टिन', texas: 'टेक्सस',
  'new delhi': 'नवदेहली', delhi: 'दिल्ली', 'புது தில்லி': 'नवदेहली', 'டெல்லி': 'दिल्ली',
  'ஃப்ளெமிங்டன்': 'फ्लेमिंग्टन', 'நியூ ஜெர்சி': 'न्यू जर्सी',
}

function sanskritPlacePhrase(locationName: string) {
  const parts = locationName.split(',').map((part) => part.trim()).filter(Boolean)
  const translated = parts.map((part) => sanskritPlaceNames[part.toLowerCase()] ?? part)
  const lastIndex = translated.length - 1
  const countryLabel = parts[lastIndex] ?? ''
  if (/united states|america|अमेरिक|संयुक्त राज्य|அமெரிக்க|అమెరిక|ಅಮೆರಿಕ|അമേരിക്ക|અમેરિક|আমেরিক|ਅਮਰੀਕ/i.test(countryLabel)) translated[lastIndex] = 'अमेरिका'
  if (/india|भारत|இந்தியா|భారత|ಭಾರತ|ഇന്ത്യ|ભારત|ভারত|ਭਾਰਤ/i.test(countryLabel)) translated[lastIndex] = 'भारत'
  const knownCountry = translated[lastIndex] === 'अमेरिका' || translated[lastIndex] === 'भारत'
  if (!knownCountry) {
    const usState = /\b(NJ|New Jersey)\b|न्यू जर्सी/i.test(locationName)
    return `${translated.join(', ') || 'अत्र'} स्थाने${usState ? ', अमेरिकाखण्डे' : ''}`
  }
  if (translated.length >= 3) {
    const country = translated[translated.length - 1]
    return `${translated.slice(0, -1).join(', ')} स्थाने, ${country === 'अमेरिका' ? 'अमेरिकाखण्डे' : `${country} देशे`}`
  }
  if (translated.length === 2) return `${translated[0]} स्थाने, ${translated[1] === 'अमेरिका' ? 'अमेरिकाखण्डे' : `${translated[1]} देशे`}`
  return `${translated[0] ?? 'अत्र'} स्थाने`
}

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

function customSanskrit(value: string) {
  const normalized = sankalpaScript(value.normalize('NFC'), 'hi')
  if (/प्रेमिका\s*(?:के\s*)?(?:रूप\s*(?:मे|में)|रूपेण).*प्राप्त/.test(normalized)) return 'प्रेमिकारूपेण प्राप्त्यर्थम्'
  return /हयमुख.*ग[नं]्ध?र्व.*मित्र|हयमुख.*गंधर्व.*मित्र/.test(value)
    ? 'हयमुखगन्धर्वस्य मित्ररूपेण प्राप्त्यर्थम्' : value
}

function localOption(_t: unknown, language: LanguageCode, group: 'ritual' | 'purpose' | 'deity' | 'duration', option: readonly string[]) {
  return sankalpaOption(language, group, option[0]!)
}

export function SankalpaTab({ data, selectedDate, locationName }: Props) {
  const { i18n, t } = useTranslation()
  const language = (i18n.language.split('-')[0] || 'en') as LanguageCode
  const [form, setForm] = useState<FormState>(emptyForm)
  const [downloading, setDownloading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [sanskritFontSize, setSanskritFontSize] = useState(18)
  const [localFontSize, setLocalFontSize] = useState(16)
  const documentRef = useRef<HTMLDivElement>(null)
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const personalFields: Array<keyof FormState> = ['name', 'father', 'mother', 'spouse', 'children', 'gotra', 'address', 'temporaryAddress', 'otherRitual', 'otherPurpose', 'otherDeity', 'otherDuration', 'count']
  const hasPersonalData = personalFields.some((key) => form[key].trim().length > 0)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('gajaa:sankalpa-dirty', { detail: hasPersonalData }))
    const warnOnExit = (event: BeforeUnloadEvent) => {
      if (!hasPersonalData) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnOnExit)
    return () => {
      window.removeEventListener('beforeunload', warnOnExit)
      window.dispatchEvent(new CustomEvent('gajaa:sankalpa-dirty', { detail: false }))
    }
  }, [hasPersonalData])

  const generated = useMemo(() => {
    if (!data) return null
    const ritualOption = ritualGroups.flatMap((group) => [...group.options]).find((option) => option[0] === form.ritual)
    const ritualLabel = form.ritual === 'other' && form.otherRitual ? form.otherRitual : ritualOption ? localOption(t, language, 'ritual', ritualOption) : form.ritual
    const ritualSanskrit = form.ritual === 'other' && form.otherRitual ? customSanskrit(form.otherRitual) : optionValue(ritualGroups, form.ritual, 2)
    const purposeOption = purposes.find((option) => option[0] === form.purpose)
    const purposeLabel = form.purpose === 'other' && form.otherPurpose ? form.otherPurpose : purposeOption ? localOption(t, language, 'purpose', purposeOption) : form.purpose
    const purposeSanskrit = form.purpose === 'other' && form.otherPurpose
      ? customSanskrit(form.otherPurpose)
      : simpleOptionValue(purposes, form.purpose, 2)
    const deityOption = deities.find((option) => option[0] === form.deity)
    const deityLabel = form.deity === 'other' && form.otherDeity ? form.otherDeity : deityOption ? localOption(t, language, 'deity', deityOption) : form.deity
    const deitySanskrit = form.deity === 'other' && form.otherDeity ? form.otherDeity : simpleOptionValue(deities, form.deity, 2)
    const sa = (value: string) => sankalpaScript(value.trim(), 'hi')
    const native = (value: string) => sankalpaScript(value.trim(), language)
    const dateObject = new Date(`${selectedDate}T12:00:00`)
    const familySanskrit = [form.father && `पितृनाम ${sa(form.father)}`, form.mother && `मातृनाम ${sa(form.mother)}`, form.spouse && `जीवनसाथिनाम ${sa(form.spouse)}`, form.children && `सन्ताननाम ${sa(form.children)}`].filter(Boolean).join(', ')
    const practiceSanskrit = [form.count && `${sa(form.count)} आवृत्तिपरिमाणेन`, form.duration === 'custom' && form.otherDuration ? sanskritDuration(form.otherDuration) : simpleOptionValue(durations, form.duration, 2)].filter(Boolean).join(' ')
    const location = form.temporaryAddress.trim() || form.address.trim() || locationName
    const normalizeAddress = (value: string) => sankalpaScript(value.normalize('NFC'), 'hi').toLocaleLowerCase().replace(/[\s,।.]+/g, '')
    const differentAddress = Boolean(form.temporaryAddress.trim() && normalizeAddress(form.temporaryAddress) !== normalizeAddress(form.address))
    const addressSanskrit = (value: string) => sa(value.split(',').map((part) => sanskritPlaceNames[part.trim().toLowerCase()] ?? part.trim()).join(', '))
    const residence = differentAddress && form.address.trim() ? `${addressSanskrit(form.address)} इति स्थायिनिवासस्थाननिवासिनः, ` : ''
    const seated = form.temporaryAddress.trim() ? 'उपविश्य ' : ''
    const gotraSanskrit = sa(form.gotra)
    const personSanskrit = `${gotraSanskrit ? `${gotraSanskrit} गोत्रस्य ` : ''}${sa(form.name) || '________'} नामधेयस्य`
    const sanskrit = `ॐ विष्णुर्विष्णुर्विष्णुः। अद्य ${sa(sanskritPlacePhrase(location))}, ${localized(data.month_name, 'hi')} मासे, ${data.paksha === 'krishna' ? 'कृष्ण' : 'शुक्ल'} पक्षे, ${localized(data.tithi.name, 'hi')} तिथौ, ${sanskritWeekdays[dateObject.getDay()]}, ${localized(data.nakshatra.name, 'hi')} नक्षत्रे, ${residence}${personSanskrit} ${familySanskrit ? `${familySanskrit}, ` : ''}${form.participation === 'family' ? 'सकुटुम्बस्य ' : ''}${sa(deitySanskrit)} प्रीत्यर्थं ${sa(purposeSanskrit)} ${practiceSanskrit} ${seated}${sa(ritualSanskrit)} करिष्ये। अस्मिन् प्रयोगे मम पूर्णसफलताप्राप्त्यर्थम् आशीर्वादं प्रयच्छन्तु।`
    const values = {
      date: formatDisplayDate(selectedDate, language), location: native(location),
      name: native(form.name) || '________', gotra: native(form.gotra), ritual: native(ritualLabel ?? form.ritual),
      deity: native(deityLabel ?? form.deity), purpose: native(purposeLabel ?? form.purpose), weekday: formatWeekday(selectedDate, language),
      month: `${localized(data.month_name, language)} ${t('month')}`, paksha: data.paksha ? `${pakshaNames[language][data.paksha === 'krishna' ? 'krishna' : 'shukla']} ${t('paksha')}` : '—',
      tithi: `${localized(data.tithi.name, language)} ${t('tithi')}`, nakshatra: `${localized(data.nakshatra.name, language)} ${t('nakshatra')}`,
    }
    const durationOption = durations.find((option) => option[0] === form.duration)
    const durationLabel = form.duration === 'custom' ? form.otherDuration : durationOption ? localOption(t, language, 'duration', durationOption) : form.duration
    const family = [form.father && `${t('sankalpaFather')}: ${native(form.father)}`, form.mother && `${t('sankalpaMother')}: ${native(form.mother)}`, form.spouse && `${t('sankalpaSpouse')}: ${native(form.spouse)}`, form.children && `${t('sankalpaChildren')}: ${native(form.children)}`].filter(Boolean).join(' · ')
    const translated = sankalpaSentence(language, { ...values, residence: differentAddress ? native(form.address) : '', gender: form.gender, duration: native(durationLabel || '—'), count: native(form.count), family, alone: form.participation === 'alone' ? 'yes' : 'no' })
    return { sanskrit, translated }
  }, [data, form, language, locationName, selectedDate, t])

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
    } finally {
      setDownloading(false)
    }
  }

  if (!data) return <div className="rounded-3xl border border-[#D7E7F0] bg-white p-6 text-sm text-slate-500">{t('loading')}</div>

  const inputClass = 'mt-1 w-full rounded-xl border border-[#D7E7F0] bg-[#F5FAFD] px-3 py-2 text-sm'
  const helpLabel = (key: string, label: string, inverse = false) => <FieldHelp explanation={(fieldHelp[language]?.[key] ?? t(`sankalpaHelp.${key}`)).replaceAll('Other', sankalpaOption(language, 'ritual', 'other'))} inverse={inverse} label={label}>{label}</FieldHelp>
  return (
    <section className="space-y-4" onFocusCapture={(event) => {
      const field = event.target
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) setFocusedField(field.name)
    }} onBlurCapture={() => setFocusedField(null)}>
      <div className="rounded-3xl border border-[#D7E7F0] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">{t('sankalpa')}</h2>
        <div className="mt-3 flex gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900"><ShieldCheck className="h-5 w-5 shrink-0" /><p>{t('sankalpaPrivacy')}</p></div>
        <p className="mt-3 text-xs text-slate-500">{t('sankalpaGuidance')}</p>
        <p className="mt-3 text-sm text-slate-600">{inputGuidance[language]}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">{helpLabel('gender', genderText[language][0])}<select name="gender" className={inputClass} value={form.gender} onChange={(event) => update('gender', event.target.value)}>{['neutral', 'male', 'female'].map((value, index) => <option key={value} value={value}>{genderText[language][index + 1]}</option>)}</select></label>
          <label className="text-sm font-medium">{helpLabel('participation', participation[language][0])}<select name="participation" className={inputClass} value={form.participation} onChange={(event) => update('participation', event.target.value)}><option value="alone">{participation[language][1]}</option><option value="family">{participation[language][2]}</option></select></label>
          <label className="text-sm font-medium">{helpLabel('ritual', t('sankalpaType'))}<select className={inputClass} value={form.ritual} onChange={(event) => update('ritual', event.target.value)}>{ritualGroups.map((group) => <optgroup key={group.label} label={t(`sankalpaGroup.${group.label}`, { defaultValue: group.label })}>{group.options.map((option) => <option key={option[0]} value={option[0]}>{localOption(t, language, 'ritual', option)}</option>)}</optgroup>)}</select></label>
          <label className="text-sm font-medium">{helpLabel('purpose', t('sankalpaPurpose'))}<select className={inputClass} value={form.purpose} onChange={(event) => update('purpose', event.target.value)}>{purposes.map((option) => <option key={option[0]} value={option[0]}>{localOption(t, language, 'purpose', option)}</option>)}</select></label>
          {form.ritual === 'other' ? <label className="text-sm font-medium">{helpLabel('otherRitual', t('sankalpaDescribeRitual'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="otherRitual" lang={language} value={focusedField === 'otherRitual' ? form.otherRitual : sankalpaScript(form.otherRitual, language)} onChange={(event) => update('otherRitual', event.target.value)} /></label> : null}
          {form.purpose === 'other' ? <label className="text-sm font-medium">{helpLabel('otherPurpose', t('sankalpaDescribePurpose'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="otherPurpose" lang={language} value={focusedField === 'otherPurpose' ? form.otherPurpose : sankalpaScript(form.otherPurpose, language)} onChange={(event) => update('otherPurpose', event.target.value)} /></label> : null}
          <label className="text-sm font-medium">{helpLabel('deity', t('sankalpaDeity'))}<select className={inputClass} value={form.deity} onChange={(event) => update('deity', event.target.value)}>{deities.map((option) => <option key={option[0]} value={option[0]}>{localOption(t, language, 'deity', option)}</option>)}</select></label>
          <label className="text-sm font-medium">{helpLabel('duration', t('sankalpaDuration'))}<select className={inputClass} value={form.duration} onChange={(event) => update('duration', event.target.value)}>{durations.map((option) => <option key={option[0]} value={option[0]}>{localOption(t, language, 'duration', option)}</option>)}</select></label>
          {form.deity === 'other' ? <label className="text-sm font-medium">{helpLabel('otherDeity', t('sankalpaDescribeDeity'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="otherDeity" lang={language} value={focusedField === 'otherDeity' ? form.otherDeity : sankalpaScript(form.otherDeity, language)} onChange={(event) => update('otherDeity', event.target.value)} /></label> : null}
          {form.duration === 'custom' ? <label className="text-sm font-medium">{helpLabel('otherDuration', t('sankalpaCustomDuration'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="otherDuration" lang={language} value={focusedField === 'otherDuration' ? form.otherDuration : sankalpaScript(form.otherDuration, language)} onChange={(event) => update('otherDuration', event.target.value)} /></label> : null}
          <label className="text-sm font-medium">{helpLabel('count', t('sankalpaCount'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} inputMode="numeric" name="count" lang={language} value={focusedField === 'count' ? form.count : sankalpaScript(form.count, language)} onChange={(event) => update('count', event.target.value)} /></label>
          <label className="text-sm font-medium">{helpLabel('name', t('sankalpaName'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="name" lang={language} value={focusedField === 'name' ? form.name : sankalpaScript(form.name, language)} onChange={(event) => update('name', event.target.value)} /></label>
          <label className="text-sm font-medium">{helpLabel('gotra', t('sankalpaGotra'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="gotra" lang={language} value={focusedField === 'gotra' ? form.gotra : sankalpaScript(form.gotra, language)} onChange={(event) => update('gotra', event.target.value)} /></label>
          <label className="text-sm font-medium">{helpLabel('father', t('sankalpaFather'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="father" lang={language} value={focusedField === 'father' ? form.father : sankalpaScript(form.father, language)} onChange={(event) => update('father', event.target.value)} /></label>
          <label className="text-sm font-medium">{helpLabel('mother', t('sankalpaMother'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="mother" lang={language} value={focusedField === 'mother' ? form.mother : sankalpaScript(form.mother, language)} onChange={(event) => update('mother', event.target.value)} /></label>
          <label className="text-sm font-medium">{helpLabel('spouse', t('sankalpaSpouse'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="spouse" lang={language} value={focusedField === 'spouse' ? form.spouse : sankalpaScript(form.spouse, language)} onChange={(event) => update('spouse', event.target.value)} /></label>
          <label className="text-sm font-medium">{helpLabel('children', t('sankalpaChildren'))}<input className={inputClass} placeholder={t('sankalpaEnterValue')} name="children" lang={language} value={focusedField === 'children' ? form.children : sankalpaScript(form.children, language)} onChange={(event) => update('children', event.target.value)} /></label>
          <label className="text-sm font-medium sm:col-span-2">{helpLabel('address', addressText[language][0])}<textarea className={inputClass} placeholder={t('sankalpaEnterValue')} rows={3} name="address" lang={language} value={focusedField === 'address' ? form.address : sankalpaScript(form.address, language)} onChange={(event) => update('address', event.target.value)} /></label>
          <label className="text-sm font-medium sm:col-span-2">{helpLabel('activity', addressText[language][1])}<textarea className={inputClass} placeholder={t('sankalpaEnterValue')} rows={3} name="temporaryAddress" lang={language} value={focusedField === 'temporaryAddress' ? form.temporaryAddress : sankalpaScript(form.temporaryAddress, language)} onChange={(event) => update('temporaryAddress', event.target.value)} /></label>
        </div>
      </div>

      {generated ? <div ref={documentRef} className="rounded-3xl border border-[#D7E7F0] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3"><img className="h-12 w-12 rounded-full" src={`${import.meta.env.BASE_URL}logo.svg`} alt="Gajaa Panchang" /><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#163B63]">{t('appName')}</div><h3 className="mt-1 text-xl font-semibold">{t('sankalpa')} · {formatDisplayDate(selectedDate, language)}</h3><p className="text-sm text-slate-500">{locationName}</p></div></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">{t('sanskritSankalpa')}</h4><div className="flex items-center gap-1 text-xs"><span>Sanskrit font</span><button type="button" aria-label="Decrease Sanskrit font" className="rounded border px-2 py-1" onClick={() => setSanskritFontSize((size) => Math.max(12, size - 1))}>−</button><span>{sanskritFontSize}px</span><button type="button" aria-label="Increase Sanskrit font" className="rounded border px-2 py-1" onClick={() => setSanskritFontSize((size) => Math.min(32, size + 1))}>+</button></div></div><p data-testid="sanskrit-output" className="mt-2 whitespace-pre-line leading-9" style={{ fontSize: `${sanskritFontSize}px` }}>{generated.sanskrit}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">{t('sankalpaInSelectedLanguage')}</h4><div className="flex items-center gap-1 text-xs"><span>Local font</span><button type="button" aria-label="Decrease local-language font" className="rounded border px-2 py-1" onClick={() => setLocalFontSize((size) => Math.max(12, size - 1))}>−</button><span>{localFontSize}px</span><button type="button" aria-label="Increase local-language font" className="rounded border px-2 py-1" onClick={() => setLocalFontSize((size) => Math.min(32, size + 1))}>+</button></div></div><p data-testid="local-output" className="mt-2 leading-7 text-slate-700" style={{ fontSize: `${localFontSize}px` }}>{generated.translated}</p>
        <p className="mt-6 border-t border-slate-200 pt-3 text-xs text-slate-500">{t('sankalpaGeneratedNotice')}</p>
      </div> : null}
      <div className="flex flex-col gap-2 sm:flex-row"><button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#163B63] px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={downloading} onClick={downloadPdf} type="button"><Download className="h-5 w-5" />{downloading ? t('sankalpaPreparingPdf') : 'Download PDF'}</button><button className="rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-700" type="button" onClick={() => setForm(emptyForm)}>{t('sankalpaClearForm', { defaultValue: 'Clear form' })}</button></div>
    </section>
  )
}

import { useTranslation } from 'react-i18next'
import type { PanchangResponse, TimeRange } from '../types/api'
import { formatTimeWithTimezone } from '../lib/utils'

interface Props {
  data?: PanchangResponse
}

function timingLabel(t: (key: string) => string, key: string) {
  const labels: Record<string, string> = {
    abhijit: t('abhijitMuhurta'),
    amrit_kala: t('amritKala'),
    rahu_kaal: t('rahuKaal'),
    yamagandam: t('yamagandam'),
    gulika: t('gulikaKaal'),
  }
  return labels[key] ?? key
}

function directionLabel(t: (key: string) => string, direction: string | undefined) {
  const directions: Record<string, string> = {
    north: t('directionNorth'), south: t('directionSouth'), east: t('directionEast'), west: t('directionWest'),
  }
  return directions[direction?.toLowerCase() ?? ''] ?? direction ?? '—'
}

const DESCRIPTIONS: Record<string, Record<string, string>> = {
  en: { abhijit: 'A midday window traditionally favored for important beginnings.', amrit_kala: 'A favorable period for beneficial activities.', rahu_kaal: 'Traditionally avoided for starting auspicious new work.', yamagandam: 'Traditionally avoided for auspicious beginnings.', gulika: 'Used differently by tradition; follow regional guidance.' },
  hi: { abhijit: 'महत्वपूर्ण आरंभ के लिए पारंपरिक रूप से शुभ दोपहर का समय।', amrit_kala: 'कल्याणकारी कार्यों के लिए अनुकूल समय।', rahu_kaal: 'शुभ नए कार्य आरंभ करने से पारंपरिक रूप से बचा जाता है।', yamagandam: 'शुभ आरंभ के लिए पारंपरिक रूप से वर्जित समय।', gulika: 'परंपरा के अनुसार भिन्न उपयोग; स्थानीय मार्गदर्शन मानें।' },
  mr: { abhijit: 'महत्त्वाच्या आरंभासाठी पारंपरिकदृष्ट्या शुभ दुपारचा काळ.', amrit_kala: 'हितकारक कार्यांसाठी अनुकूल काळ.', rahu_kaal: 'शुभ नवीन कार्य सुरू करण्यासाठी पारंपरिकदृष्ट्या टाळला जातो.', yamagandam: 'शुभ आरंभासाठी पारंपरिकदृष्ट्या टाळण्याचा काळ.', gulika: 'परंपरेनुसार उपयोग वेगळा; स्थानिक मार्गदर्शन पाळा.' },
  ta: { abhijit: 'முக்கிய தொடக்கங்களுக்கு பாரம்பரியமாக உகந்த மதிய நேரம்.', amrit_kala: 'நன்மை தரும் செயல்களுக்கு ஏற்ற நேரம்.', rahu_kaal: 'சுபமான புதிய செயல்களைத் தொடங்க பாரம்பரியமாகத் தவிர்க்கப்படும் நேரம்.', yamagandam: 'சுப தொடக்கங்களுக்கு பாரம்பரியமாகத் தவிர்க்கப்படும் நேரம்.', gulika: 'மரபின்படி பயன்பாடு மாறும்; உள்ளூர் வழிகாட்டுதலைப் பின்பற்றவும்.' },
  te: { abhijit: 'ముఖ్యమైన ప్రారంభాలకు సాంప్రదాయంగా అనుకూలమైన మధ్యాహ్న సమయం.', amrit_kala: 'శుభకరమైన పనులకు అనుకూల సమయం.', rahu_kaal: 'శుభకరమైన కొత్త పనుల ప్రారంభానికి సాంప్రదాయంగా నివారించేది.', yamagandam: 'శుభ ప్రారంభాలకు సాంప్రదాయంగా నివారించేది.', gulika: 'సంప్రదాయం ప్రకారం ఉపయోగం మారుతుంది; స్థానిక మార్గదర్శకత్వం పాటించండి.' },
  kn: { abhijit: 'ಮುಖ್ಯ ಆರಂಭಗಳಿಗೆ ಸಂಪ್ರದಾಯವಾಗಿ ಶುಭವಾದ ಮಧ್ಯಾಹ್ನದ ಸಮಯ.', amrit_kala: 'ಹಿತಕರ ಕಾರ್ಯಗಳಿಗೆ ಅನುಕೂಲವಾದ ಸಮಯ.', rahu_kaal: 'ಶುಭ ಹೊಸ ಕಾರ್ಯಗಳನ್ನು ಆರಂಭಿಸಲು ಸಂಪ್ರದಾಯವಾಗಿ ತಪ್ಪಿಸಲಾಗುತ್ತದೆ.', yamagandam: 'ಶುಭ ಆರಂಭಗಳಿಗೆ ಸಂಪ್ರದಾಯವಾಗಿ ತಪ್ಪಿಸುವ ಸಮಯ.', gulika: 'ಸಂಪ್ರದಾಯದಂತೆ ಬಳಕೆ ಬದಲಾಗುತ್ತದೆ; ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶನ ಪಾಲಿಸಿ.' },
  ml: { abhijit: 'പ്രധാന തുടക്കങ്ങൾക്ക് പാരമ്പര്യമായി അനുയോജ്യമായ ഉച്ചസമയം.', amrit_kala: 'നന്മയുള്ള പ്രവർത്തനങ്ങൾക്ക് അനുകൂലമായ സമയം.', rahu_kaal: 'ശുഭകരമായ പുതിയ പ്രവർത്തനങ്ങൾ തുടങ്ങാൻ പാരമ്പര്യമായി ഒഴിവാക്കുന്നു.', yamagandam: 'ശുഭ തുടക്കങ്ങൾക്ക് പാരമ്പര്യമായി ഒഴിവാക്കുന്ന സമയം.', gulika: 'പാരമ്പര്യമനുസരിച്ച് ഉപയോഗം മാറും; പ്രാദേശിക മാർഗനിർദേശം പാലിക്കുക.' },
  gu: { abhijit: 'મહત્વપૂર્ણ શરૂઆત માટે પરંપરાગત રીતે શુભ બપોરનો સમય.', amrit_kala: 'લાભદાયી કાર્યો માટે અનુકૂળ સમય.', rahu_kaal: 'શુભ નવા કાર્યની શરૂઆત માટે પરંપરાગત રીતે ટાળવામાં આવે છે.', yamagandam: 'શુભ શરૂઆત માટે પરંપરાગત રીતે ટાળવાનો સમય.', gulika: 'પરંપરા પ્રમાણે ઉપયોગ બદલાય; સ્થાનિક માર્ગદર્શન અનુસરો.' },
  bn: { abhijit: 'গুরুত্বপূর্ণ শুরুর জন্য ঐতিহ্যগতভাবে শুভ মধ্যাহ্নকাল।', amrit_kala: 'কল্যাণকর কাজের জন্য অনুকূল সময়।', rahu_kaal: 'শুভ নতুন কাজ শুরু করতে ঐতিহ্যগতভাবে এড়ানো হয়।', yamagandam: 'শুভ শুরুর জন্য ঐতিহ্যগতভাবে এড়ানোর সময়।', gulika: 'পরম্পরা অনুযায়ী ব্যবহার ভিন্ন; স্থানীয় নির্দেশ মানুন।' },
  pa: { abhijit: 'ਮਹੱਤਵਪੂਰਨ ਸ਼ੁਰੂਆਤਾਂ ਲਈ ਰਵਾਇਤੀ ਤੌਰ ਤੇ ਸ਼ੁਭ ਦੁਪਹਿਰ ਦਾ ਸਮਾਂ।', amrit_kala: 'ਲਾਭਦਾਇਕ ਕੰਮਾਂ ਲਈ ਅਨੁਕੂਲ ਸਮਾਂ।', rahu_kaal: 'ਸ਼ੁਭ ਨਵੇਂ ਕੰਮ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਰਵਾਇਤੀ ਤੌਰ ਤੇ ਟਾਲਿਆ ਜਾਂਦਾ ਹੈ।', yamagandam: 'ਸ਼ੁਭ ਸ਼ੁਰੂਆਤਾਂ ਲਈ ਰਵਾਇਤੀ ਤੌਰ ਤੇ ਟਾਲਣ ਵਾਲਾ ਸਮਾਂ।', gulika: 'ਰਵਾਇਤ ਅਨੁਸਾਰ ਵਰਤੋਂ ਵੱਖਰੀ; ਸਥਾਨਕ ਮਾਰਗਦਰਸ਼ਨ ਮੰਨੋ।' },
}

function timingDescription(key: string, language: string) {
  return DESCRIPTIONS[language]?.[key] ?? DESCRIPTIONS.en?.[key] ?? ''
}

function DailyTiming({ label, description, value, timezone, date, language }: { label: string; description: string; value: TimeRange; timezone: string; date: string; language: string }) {
  return (
    <div className="flex min-h-32 flex-col justify-center rounded-2xl border border-sky-100 bg-white px-5 py-4">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="mt-1 text-sm text-[#163B63]">
        {formatTimeWithTimezone(value.start_at ?? value.start, timezone, date, language)} — {formatTimeWithTimezone(value.end_at ?? value.end, timezone, date, language)}
      </div>
      <div className="mt-2 text-xs leading-relaxed text-slate-500">{description}</div>
    </div>
  )
}

export function MuhurtaTab({ data }: Props) {
  const { t, i18n } = useTranslation()

  if (!data) {
    return <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100"><p className="text-sm text-slate-500">{t('loading')}</p></section>
  }

  const timings: Array<[string, TimeRange]> = [
    ['abhijit', data.muhurta.abhijit],
    ['amrit_kala', data.muhurta.amrit_kala],
    ['rahu_kaal', data.rahu_kaal],
    ['yamagandam', data.muhurta.yamagandam],
    ['gulika', data.muhurta.gulika],
  ]

  return (
    <section className="min-h-[calc(100vh-20rem)] space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7E7F0]">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t('dailyTimings')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('calculatedReference')}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {timings.map(([key, value]) => <DailyTiming key={key} label={timingLabel(t, key)} description={timingDescription(key, i18n.language)} value={value} timezone={data.location.tz} date={data.date} language={i18n.language} />)}
      </div>
      <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-700">
        <span className="font-semibold">{t('dishaShool')}:</span> {directionLabel(t, data.muhurta.disha_shool)}
      </div>
    </section>
  )
}

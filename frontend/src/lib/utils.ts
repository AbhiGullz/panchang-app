import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { LANGUAGE_LABELS } from '../types/api'
import type { CalendarSchool, LanguageCode, LocalizedNames } from '../types/api'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateInput(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDisplayDate(value: string, language: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day))
}

export function formatWeekday(value: string, language: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat(language, { weekday: 'long' }).format(new Date(year, month - 1, day))
}

const AYANAMSA_LABELS: Record<string, LocalizedNames> = {
  lahiri: { en: 'Lahiri', hi: 'लाहिरी', mr: 'लाहिरी', ta: 'லஹிரி', te: 'లహిరి', kn: 'ಲಹಿರಿ', ml: 'ലഹിരി', gu: 'લાહિરી', bn: 'লাহিড়ী', pa: 'ਲਹਿਰੀ' },
}

export function humanizeAyanamsa(value: string, language: string) {
  const labels = AYANAMSA_LABELS[value.toLowerCase()]
  return labels?.[language as LanguageCode] ?? labels?.en ?? value
}

export function humanizeTimezone(timezone: string, language: string) {
  try {
    const parts = new Intl.DateTimeFormat(language, { timeZone: timezone, timeZoneName: 'long' }).formatToParts(new Date())
    return parts.find((part) => part.type === 'timeZoneName')?.value ?? timezone
  } catch {
    return timezone
  }
}

export function formatTimeWithTimezone(time: string, timezone: string, date: string, locale = 'en-IN') {
  const instant = time.includes('T') ? new Date(time) : new Date(`${date}T12:00:00Z`)
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    hour12: false,
  })
  const parts = formatter.formatToParts(instant)
  const clock = time.includes('T')
    ? `${parts.find((part) => part.type === 'hour')?.value ?? ''}:${parts.find((part) => part.type === 'minute')?.value ?? ''}`
    : time
  const timezoneParts = new Intl.DateTimeFormat('en-IN', { timeZone: timezone, timeZoneName: 'short' }).formatToParts(instant)
  const shortName = timezoneParts.find((part) => part.type === 'timeZoneName')?.value
  const longName = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'long' })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value
  const abbreviation = shortName && !shortName.startsWith('GMT')
    ? shortName
    : longName?.split(/\s+/).filter((word) => /^[A-Z]/.test(word)).map((word) => word[0]).join('') ?? timezone
  return `${clock} ${abbreviation}`
}

export function addDaysDateInput(value: Date, days: number) {
  const result = new Date(value)
  result.setDate(result.getDate() + days)
  return formatDateInput(result)
}

const CALENDAR_LABELS: Record<CalendarSchool, LocalizedNames> = {
  purnimanta: { en: 'Purnimanta', hi: 'पूर्णिमांत', mr: 'पौर्णिमान्त', ta: 'பௌர்ணிமாந்த', te: 'పౌర్ణిమాంత', kn: 'ಪೂರ್ಣಿಮಾಂತ', ml: 'പൗർണമാന്ത', gu: 'પૂર્ણિમાંત', bn: 'পূর্ণিমান্ত', pa: 'ਪੂਰਨਿਮਾਂਤ' },
  amanta: { en: 'Amanta', hi: 'अमांत', mr: 'अमान्त', ta: 'அமாந்த', te: 'అమాంత', kn: 'ಅಮಾಂತ', ml: 'അമാന്ത', gu: 'અમાન્ત', bn: 'অমান্ত', pa: 'ਅਮਾਂਤ' },
  gujarati: { en: 'Gujarati', hi: 'गुजराती', mr: 'गुजराती', ta: 'குஜராத்தி', te: 'గుజరాతీ', kn: 'ಗುಜರಾತಿ', ml: 'ഗുജറാത്തി', gu: 'ગુજરાતી', bn: 'গুজরাটি', pa: 'ਗੁਜਰਾਤੀ' },
  marathi: { en: 'Marathi', hi: 'मराठी', mr: 'मराठी', ta: 'மராத்தி', te: 'మరాఠీ', kn: 'ಮರಾಠಿ', ml: 'മറാത്തി', gu: 'મરાઠી', bn: 'মারাঠি', pa: 'ਮਰਾਠੀ' },
  nanakshahi: { en: 'Nanakshahi', hi: 'नानकशाही', mr: 'नानकशाही', ta: 'நானக்ஷாஹி', te: 'నానక్‌షాహీ', kn: 'ನಾನಕ್‌ಶಾಹಿ', ml: 'നാനക്‌ഷാഹി', gu: 'નાનકશાહી', bn: 'নানকশাহী', pa: 'ਨਾਨਕਸ਼ਾਹੀ' },
  tamil: { en: 'Tamil', hi: 'तमिल', mr: 'तमिळ', ta: 'தமிழ்', te: 'తమిళ', kn: 'ತಮಿಳು', ml: 'തമിഴ്', gu: 'તમિલ', bn: 'তামিল', pa: 'ਤਮਿਲ' },
  malayalam: { en: 'Malayalam', hi: 'मलयालम', mr: 'മल्याळम', ta: 'மலையாளம்', te: 'మలయాళం', kn: 'മലയാളം', ml: 'മലയാളം', gu: 'મલયાલમ', bn: 'মালয়ালম', pa: 'ਮਲਿਆਲਮ' },
  bengali: { en: 'Bengali', hi: 'बंगाली', mr: 'बंगाली', ta: 'வங்காளம்', te: 'బెంగాలీ', kn: 'ಬಂಗಾಳಿ', ml: 'ബംഗാളി', gu: 'બંગાળી', bn: 'বাংলা', pa: 'ਬੰਗਾਲੀ' },
}

export function humanizeLanguage(language: LanguageCode) {
  return LANGUAGE_LABELS[language]
}

export function humanizeCalendar(calendar: string, language: string = 'en') {
  const labels = CALENDAR_LABELS[calendar as CalendarSchool]
  return labels?.[language as LanguageCode] ?? labels?.en ?? calendar.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export const MUHURTA_LABELS: Record<string, Record<string, string>> = {
  travel: { en: 'Travel', mr: 'प्रवास' }, wedding: { en: 'Wedding', mr: 'विवाह' },
  'griha-pravesh': { en: 'House entry', mr: 'गृहप्रवेश' }, naming: { en: 'Naming', mr: 'नामकरण' },
  vehicle: { en: 'Vehicle purchase', mr: 'वाहन खरेदी' }, property: { en: 'Property purchase', mr: 'मालमत्ता खरेदी' },
}

export function humanizeMuhurta(category: string, language: string) {
  return MUHURTA_LABELS[category]?.[language] ?? MUHURTA_LABELS[category]?.en ?? category
}

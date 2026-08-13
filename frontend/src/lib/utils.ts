import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day))
}

export function addDaysDateInput(value: Date, days: number) {
  const result = new Date(value)
  result.setDate(result.getDate() + days)
  return formatDateInput(result)
}

const CALENDAR_LABELS: Record<string, Record<string, string>> = {
  purnimanta: { en: 'Purnimanta', mr: 'पौर्णिमान्त' }, amanta: { en: 'Amanta', mr: 'अमान्त' },
  gujarati: { en: 'Gujarati', mr: 'गुजराती' }, marathi: { en: 'Marathi', mr: 'मराठी' },
  nanakshahi: { en: 'Nanakshahi', mr: 'नानकशाही' }, tamil: { en: 'Tamil', mr: 'तमिळ' },
  malayalam: { en: 'Malayalam', mr: 'मल्याळम' }, bengali: { en: 'Bengali', mr: 'बंगाली' },
}

export function humanizeCalendar(calendar: string, language = 'en') {
  return CALENDAR_LABELS[calendar]?.[language] ?? CALENDAR_LABELS[calendar]?.en ?? calendar.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export const MUHURTA_LABELS: Record<string, Record<string, string>> = {
  travel: { en: 'Travel', mr: 'प्रवास' }, wedding: { en: 'Wedding', mr: 'विवाह' },
  'griha-pravesh': { en: 'House entry', mr: 'गृहप्रवेश' }, naming: { en: 'Naming', mr: 'नामकरण' },
  vehicle: { en: 'Vehicle purchase', mr: 'वाहन खरेदी' }, property: { en: 'Property purchase', mr: 'मालमत्ता खरेदी' },
}

export function humanizeMuhurta(category: string, language: string) {
  return MUHURTA_LABELS[category]?.[language] ?? MUHURTA_LABELS[category]?.en ?? category
}

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'ml', 'gu', 'bn', 'pa'] as const
export const SUPPORTED_CALENDARS = [
  'purnimanta',
  'amanta',
  'gujarati',
  'marathi',
  'nanakshahi',
  'tamil',
  'malayalam',
  'bengali',
] as const
export const MUHURTA_CATEGORIES = ['travel', 'wedding', 'griha-pravesh', 'naming', 'vehicle', 'property'] as const
export const AYANAMSA_OPTIONS = [{ value: 'Lahiri', label: 'Lahiri' }] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]
export interface LanguageOption {
  code: LanguageCode
  label: string
}

export const SUPPORTED_LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
] satisfies readonly LanguageOption[]

export const LANGUAGE_LABELS = {
  en: 'English', hi: 'हिंदी', mr: 'मराठी', ta: 'தமிழ்', te: 'తెలుగు',
  kn: 'ಕನ್ನಡ', ml: 'മലയാളം', gu: 'ગુજરાતી', bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ',
} satisfies Record<LanguageCode, string>

export type CalendarSchool = (typeof SUPPORTED_CALENDARS)[number]
export type MuhurtaCategory = (typeof MUHURTA_CATEGORIES)[number]

export type LocalizedNames = Record<LanguageCode, string>

export interface LocationPreference {
  city: string
  lat: number
  lng: number
  tz: string
}

export interface GeocodeResult {
  display_name: string
  lat: number
  lng: number
  tz: string
}

export interface TransitionElement {
  start?: string | null
  end?: string | null
  next?: { index: number; name: string; at?: string | null } | null
}

export interface LocalizedTransition {
  start?: string | null
  end?: string | null
  next?: { index: number; name: LocalizedNames; at?: string | null } | null
}

export interface PanchangResponse {
  date: string
  location: {
    name: string
    lat: number
    lng: number
    tz: string
  }
  sun: {
    rise: string
    set: string
    rise_at?: string | null
    set_at?: string | null
    moonrise_at?: string | null
    moonset_at?: string | null
  }
  tithi: TransitionElement & {
    index: number
    name: LocalizedNames
    ends_at?: string | null
  }
  nakshatra: TransitionElement & {
    index: number
    name: LocalizedNames
    pada: number
  }
  yoga: TransitionElement & {
    index: number
    name: LocalizedNames
  }
  karana: TransitionElement & {
    index?: number | null
    name: LocalizedNames
    transitions?: Array<{ at: string; index: number; name: string }>
  }
  moon_sign: LocalizedNames & LocalizedTransition
  month_name: LocalizedNames
  era_year: number
  paksha: string | null
  rahu_kaal: {
    start: string
    end: string
  }
  muhurta: {
    abhijit: TimeRange
    yamagandam: TimeRange
    gulika: TimeRange
    amrit_kala: TimeRange
    disha_shool: string
  }
  names_version: string
  lang_names?: Record<string, string> | null
  source: string
  phase?: {
    state: number
    elongation_degrees: number
    illumination: number
    label: string
  } | null
  timing_metadata?: {
    timezone: string
    ayanamsa: string
    calculation: string
  } | null
}

export interface TimeRange {
  start: string
  end: string
  start_at?: string | null
  end_at?: string | null
}

export interface MuhurtaWindow extends TimeRange {
  date: string
  label?: string | null
  reference?: string | null
  notes?: string | null
}

export interface MuhurtaResponse {
  date: string
  category: string
  location: {
    lat: number
    lng: number
    tz: string
    calendar: CalendarSchool
  }
  windows: MuhurtaWindow[]
  horizon_exhausted?: boolean
  guidance: string
  source: string
}

export interface FestivalItem {
  name: string
  date: string
  lunar_month?: string
  notes?: string
  localized_name?: string
  localized_notes?: string
}

export interface FestivalsResponse {
  year: number
  calendar: CalendarSchool
  lang: LanguageCode
  festivals: FestivalItem[]
  source: string
}

export interface AppPreferences {
  location: LocationPreference
  language: LanguageCode
  calendar: CalendarSchool
  notificationTime: string
  ayanamsa: string
  onboardingComplete: boolean
}

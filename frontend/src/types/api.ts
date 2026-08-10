export const SUPPORTED_LANGUAGES = ['en', 'hi', 'pa', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn'] as const
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

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]
export type CalendarSchool = (typeof SUPPORTED_CALENDARS)[number]
export type MuhurtaCategory = (typeof MUHURTA_CATEGORIES)[number]

export type LocalizedNames = Record<LanguageCode, string>

export interface LocationPreference {
  city: string
  lat: number
  lng: number
  tz: string
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
  }
  tithi: {
    index: number
    name: LocalizedNames
    ends_at?: string | null
  }
  nakshatra: {
    index: number
    name: LocalizedNames
    pada: number
  }
  yoga: {
    index: number
    name: LocalizedNames
  }
  karana: {
    index?: number | null
    name: LocalizedNames
  }
  moon_sign: LocalizedNames
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
}

export interface TimeRange {
  start: string
  end: string
}

export interface MuhurtaWindow extends TimeRange {
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
  guidance: string
  source: string
}

export interface FestivalItem {
  name: string
  date: string
  lunar_month?: string
  notes?: string
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

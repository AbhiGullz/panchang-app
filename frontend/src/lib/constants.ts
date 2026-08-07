import type { AppPreferences, CalendarSchool, LanguageCode, LocationPreference } from '../types/api'

export const DEFAULT_LOCATION: LocationPreference = {
  city: 'Delhi',
  lat: 28.6139,
  lng: 77.209,
  tz: 'Asia/Kolkata',
}

export const DEFAULT_LANGUAGE: LanguageCode = 'en'
export const DEFAULT_CALENDAR: CalendarSchool = 'purnimanta'
export const DEFAULT_NOTIFICATION_TIME = '06:30'
export const DEFAULT_AYANAMSA = 'Lahiri'
export const PREFERENCES_KEY = 'panchang-pwa-preferences'
export const PUSH_SUBSCRIPTION_KEY = 'panchang-pwa-push-subscription'
export const OFFLINE_CACHE_KEY = 'panchang-pwa-offline-days'

export const DEFAULT_PREFERENCES: AppPreferences = {
  location: DEFAULT_LOCATION,
  language: DEFAULT_LANGUAGE,
  calendar: DEFAULT_CALENDAR,
  notificationTime: DEFAULT_NOTIFICATION_TIME,
  ayanamsa: DEFAULT_AYANAMSA,
  onboardingComplete: false,
}

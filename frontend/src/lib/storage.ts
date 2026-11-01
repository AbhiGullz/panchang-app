import { DEFAULT_PREFERENCES, OFFLINE_CACHE_KEY, PREFERENCES_KEY, PUSH_SUBSCRIPTION_KEY } from './constants'
import type { AppPreferences } from '../types/api'
import { SUPPORTED_CALENDARS, SUPPORTED_LANGUAGES } from '../types/api'

export function readStoredValue(key: string): string | null {
  try { return typeof window === 'undefined' ? null : window.localStorage.getItem(key) } catch { return null }
}
export function writeStoredValue(key: string, value: string): boolean {
  try { if (typeof window === 'undefined') return false; window.localStorage.setItem(key, value); return true } catch { return false }
}

export function validStoredDate(value: string | null): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value >= '1900-01-01' && value <= '2100-12-31'
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function loadPreferences(): AppPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  const saved = safeParse<Partial<AppPreferences> | null>(readStoredValue(PREFERENCES_KEY), {}) ?? {}
  const location = saved.location
  const lat = Number(location?.lat), lng = Number(location?.lng)
  let tz = DEFAULT_PREFERENCES.location.tz
  let validTimezone = false
  try { if (typeof location?.tz === 'string' && location.tz) { new Intl.DateTimeFormat('en', { timeZone: location.tz }); tz = location.tz; validTimezone = true } } catch { /* Reject mismatched coordinates and time zone together. */ }
  const validLocation = !!location && location.lat != null && location.lng != null && Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180 && validTimezone
  return {
    ...DEFAULT_PREFERENCES,
    language: SUPPORTED_LANGUAGES.includes(saved.language!) ? saved.language! : DEFAULT_PREFERENCES.language,
    calendar: SUPPORTED_CALENDARS.includes(saved.calendar!) ? saved.calendar! : DEFAULT_PREFERENCES.calendar,
    notificationTime: typeof saved.notificationTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(saved.notificationTime) ? saved.notificationTime : DEFAULT_PREFERENCES.notificationTime,
    ayanamsa: typeof saved.ayanamsa === 'string' && saved.ayanamsa.toLowerCase() === 'lahiri' ? 'Lahiri' : DEFAULT_PREFERENCES.ayanamsa,
    onboardingComplete: saved.onboardingComplete === true && validLocation,
    location: validLocation
      ? { city: typeof location.city === 'string' && location.city.trim() ? location.city : DEFAULT_PREFERENCES.location.city, lat, lng, tz }
      : DEFAULT_PREFERENCES.location,
  }
}

export function savePreferences(preferences: AppPreferences) {
  if (typeof window === 'undefined') return
  writeStoredValue(PREFERENCES_KEY, JSON.stringify(preferences))
}

export function savePushSubscription(subscription: PushSubscriptionJSON) {
  if (typeof window === 'undefined') return
  writeStoredValue(PUSH_SUBSCRIPTION_KEY, JSON.stringify(subscription))
}

export function loadPushSubscription() {
  if (typeof window === 'undefined') return null
  return safeParse<PushSubscriptionJSON | null>(readStoredValue(PUSH_SUBSCRIPTION_KEY), null)
}

export function saveOfflineCacheIndex(entries: string[]) {
  if (typeof window === 'undefined') return
  writeStoredValue(OFFLINE_CACHE_KEY, JSON.stringify(entries.slice(-7)))
}

export function loadOfflineCacheIndex() {
  if (typeof window === 'undefined') return [] as string[]
  const entries = safeParse<unknown>(readStoredValue(OFFLINE_CACHE_KEY), [])
  return Array.isArray(entries) ? entries.filter((entry): entry is string => typeof entry === 'string') : []
}

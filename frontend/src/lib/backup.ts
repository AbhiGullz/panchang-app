import { loadPreferences, validStoredDate } from './storage'
import { loadPersonalTithis, type PersonalTithi } from './personal-tithis'
import { SUPPORTED_CALENDARS, SUPPORTED_LANGUAGES, type AppPreferences } from '../types/api'
import { PREFERENCES_KEY } from './constants'

export interface Backup { app: 'gajaa-panchang'; version: 1; createdAt: string; preferences: AppPreferences; tithis: PersonalTithi[] }
export function createBackup(): Backup {
  return { app: 'gajaa-panchang', version: 1, createdAt: new Date().toISOString(), preferences: loadPreferences(), tithis: loadPersonalTithis() }
}
export function parseBackup(text: string): Backup {
  if (text.length > 2_000_000) throw new Error('Invalid backup')
  const value = JSON.parse(text) as Backup
  const p = value?.preferences
  const validPlace = (x: { lat: number; lng: number; tz: string }) => {
    if (!x || !Number.isFinite(x.lat) || Math.abs(x.lat) > 90 || !Number.isFinite(x.lng) || Math.abs(x.lng) > 180 || typeof x.tz !== 'string') return false
    try { new Intl.DateTimeFormat('en', { timeZone: x.tz }); return true } catch { return false }
  }
  const names = (x: unknown) => !!x && typeof x === 'object' && Object.values(x).every(y => typeof y === 'string' && y.length < 10000)
  if (value?.app !== 'gajaa-panchang' || value.version !== 1 || !p || !SUPPORTED_LANGUAGES.includes(p.language) || !SUPPORTED_CALENDARS.includes(p.calendar) || !validPlace(p.location) || typeof p.location.city !== 'string' || p.location.city.length > 10000 || p.ayanamsa !== 'Lahiri' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.notificationTime) || typeof p.onboardingComplete !== 'boolean' || !Array.isArray(value.tithis) || value.tithis.length > 1000) throw new Error('Invalid backup')
  if (!value.tithis.every(x => x && typeof x.id === 'string' && x.id.length < 1000 && typeof x.name === 'string' && x.name.length < 10000 && (x.place === undefined || typeof x.place === 'string') && typeof x.date === 'string' && validStoredDate(x.date) && ['amanta', 'purnimanta'].includes(x.calendar) && validPlace(x) && Number.isInteger(x.rule?.month) && x.rule.month >= 1 && x.rule.month <= 12 && Number.isInteger(x.rule?.tithi) && x.rule.tithi >= 1 && x.rule.tithi <= 30 && typeof x.rule.adhika === 'boolean' && x.rule.calendar === x.calendar && names(x.month_names) && names(x.tithi_names))) throw new Error('Invalid backup')
  // Explicit allowlist: never restore scripts, credentials, consent, or arbitrary storage keys.
  return {
    app: 'gajaa-panchang', version: 1, createdAt: value.createdAt,
    preferences: { language: p.language, calendar: p.calendar, notificationTime: p.notificationTime, ayanamsa: p.ayanamsa, onboardingComplete: p.onboardingComplete, location: { city: p.location.city, lat: p.location.lat, lng: p.location.lng, tz: p.location.tz } },
    tithis: value.tithis.map(x => ({ id: x.id, name: x.name, date: x.date, calendar: x.calendar, lat: x.lat, lng: x.lng, tz: x.tz, place: x.place, rule: { month: x.rule.month, tithi: x.rule.tithi, adhika: x.rule.adhika, calendar: x.rule.calendar }, month_names: x.month_names, tithi_names: x.tithi_names })),
  }
}
export function restoreBackup(backup: Backup) {
  const validated = parseBackup(JSON.stringify(backup))
  const key = 'gajaa-personal-tithis-v1'
  const beforePreferences = localStorage.getItem(PREFERENCES_KEY)
  const beforeTithis = localStorage.getItem(key)
  const existing = loadPersonalTithis()
  const merged = [...existing, ...validated.tithis.filter(x => !existing.some(y => y.id === x.id))]
  try {
    localStorage.setItem(key, JSON.stringify(merged))
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(validated.preferences))
  } catch (error) {
    try {
      if (beforeTithis === null) localStorage.removeItem(key); else localStorage.setItem(key, beforeTithis)
      if (beforePreferences === null) localStorage.removeItem(PREFERENCES_KEY); else localStorage.setItem(PREFERENCES_KEY, beforePreferences)
    } catch { /* Surface the original storage failure; never claim success. */ }
    throw error
  }
  window.dispatchEvent(new Event('gajaa:personal-tithis'))
}

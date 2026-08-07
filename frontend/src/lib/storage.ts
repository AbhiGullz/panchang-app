import { DEFAULT_PREFERENCES, OFFLINE_CACHE_KEY, PREFERENCES_KEY, PUSH_SUBSCRIPTION_KEY } from './constants'
import type { AppPreferences } from '../types/api'

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
  return {
    ...DEFAULT_PREFERENCES,
    ...safeParse<Partial<AppPreferences>>(window.localStorage.getItem(PREFERENCES_KEY), {}),
  }
}

export function savePreferences(preferences: AppPreferences) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
}

export function savePushSubscription(subscription: PushSubscriptionJSON) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PUSH_SUBSCRIPTION_KEY, JSON.stringify(subscription))
}

export function loadPushSubscription() {
  if (typeof window === 'undefined') return null
  return safeParse<PushSubscriptionJSON | null>(window.localStorage.getItem(PUSH_SUBSCRIPTION_KEY), null)
}

export function saveOfflineCacheIndex(entries: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(entries.slice(-7)))
}

export function loadOfflineCacheIndex() {
  if (typeof window === 'undefined') return [] as string[]
  return safeParse<string[]>(window.localStorage.getItem(OFFLINE_CACHE_KEY), [])
}

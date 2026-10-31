import { useSyncExternalStore } from 'react'

const KEY = 'gajaa-adsterra-consent-v1'
const EVENT = 'gajaa-advertising-consent'
let sessionConsent: string | null = null
let storageUnavailable = false
function readConsent() {
  if (storageUnavailable) return sessionConsent
  try { return localStorage.getItem(KEY) } catch { return sessionConsent }
}
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener('storage', callback) }
}
export function useAdvertisingConsent() { return useSyncExternalStore(subscribe, readConsent, () => null) }
export function chooseAdvertisingConsent(value: 'granted' | 'denied') {
  sessionConsent = value
  try { localStorage.setItem(KEY, value); storageUnavailable = false } catch { storageUnavailable = true }
  window.dispatchEvent(new Event(EVENT))
}

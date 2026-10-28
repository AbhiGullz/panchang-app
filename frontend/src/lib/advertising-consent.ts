import { useSyncExternalStore } from 'react'

const KEY = 'gajaa-adsterra-consent-v1'
const EVENT = 'gajaa-advertising-consent'
function readConsent() {
  try { return localStorage.getItem(KEY) } catch { return null }
}
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener('storage', callback) }
}
export function useAdvertisingConsent() { return useSyncExternalStore(subscribe, readConsent, () => null) }
export function chooseAdvertisingConsent(value: 'granted' | 'denied') {
  try { localStorage.setItem(KEY, value) } catch { return }
  window.dispatchEvent(new Event(EVENT))
}

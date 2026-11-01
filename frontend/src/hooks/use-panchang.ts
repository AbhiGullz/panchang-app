import { useQuery } from '@tanstack/react-query'
import { fetchPanchang } from '../lib/api'
import { loadOfflineDay, saveOfflineDay } from '../lib/offline-cache'
import { loadOfflineCacheIndex, saveOfflineCacheIndex } from '../lib/storage'
import { OFFLINE_CACHE_VERSION } from '../lib/constants'
import type { CalendarSchool, LanguageCode } from '../types/api'

export function cacheKey(date: string, lat: number, lng: number, tz: string, calendar: CalendarSchool, lang: LanguageCode) {
  return `${OFFLINE_CACHE_VERSION}:${date}:${lat}:${lng}:${tz}:${calendar}:${lang}`
}

export function usePanchang(date: string, lat: number, lng: number, tz: string, calendar: CalendarSchool, lang: LanguageCode) {
  return useQuery({
    queryKey: ['panchang', date, lat, lng, tz, calendar, lang],
    queryFn: async () => {
      const key = cacheKey(date, lat, lng, tz, calendar, lang)
      try {
        const payload = await fetchPanchang({ date, lat, lng, tz, calendar, lang })
        try {
          await saveOfflineDay(key, payload)
          const entries = loadOfflineCacheIndex().filter((entry) => entry !== key)
          saveOfflineCacheIndex([...entries, key])
        } catch { /* Private/storage-limited browsers can still show live data. */ }
        return payload
      } catch (error) {
        try { const cached = await loadOfflineDay(key); if (cached) return cached } catch { /* Preserve the original network failure. */ }
        throw error
      }
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}

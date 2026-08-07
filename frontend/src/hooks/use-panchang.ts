import { useQuery } from '@tanstack/react-query'
import { fetchPanchang } from '../lib/api'
import { loadOfflineDay, saveOfflineDay } from '../lib/offline-cache'
import { loadOfflineCacheIndex, saveOfflineCacheIndex } from '../lib/storage'
import type { CalendarSchool, LanguageCode } from '../types/api'

function cacheKey(date: string, lat: number, lng: number, calendar: CalendarSchool, lang: LanguageCode) {
  return `${date}:${lat.toFixed(2)}:${lng.toFixed(2)}:${calendar}:${lang}`
}

export function usePanchang(date: string, lat: number, lng: number, tz: string, calendar: CalendarSchool, lang: LanguageCode) {
  return useQuery({
    queryKey: ['panchang', date, lat, lng, tz, calendar, lang],
    queryFn: async () => {
      const key = cacheKey(date, lat, lng, calendar, lang)
      try {
        const payload = await fetchPanchang({ date, lat, lng, tz, calendar, lang })
        await saveOfflineDay(key, payload)
        const entries = loadOfflineCacheIndex().filter((entry) => entry !== key)
        saveOfflineCacheIndex([...entries, key])
        return payload
      } catch (error) {
        const cached = await loadOfflineDay(key)
        if (cached) return cached
        throw error
      }
    },
    staleTime: 1000 * 60 * 10,
  })
}

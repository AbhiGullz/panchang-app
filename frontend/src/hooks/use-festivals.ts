import { useQuery } from '@tanstack/react-query'
import { fetchFestivals } from '../lib/api'
import type { CalendarSchool, LanguageCode } from '../types/api'

export function useFestivals(year: number, calendar: CalendarSchool, lang: LanguageCode, lat?: number, lng?: number, tz?: string) {
  return useQuery({
    queryKey: ['festivals', 'regional-v2', year, calendar, lang, lat, lng, tz],
    queryFn: () => fetchFestivals({ year, calendar, lang, lat, lng, tz }),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}

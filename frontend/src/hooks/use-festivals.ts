import { useQuery } from '@tanstack/react-query'
import { fetchFestivals } from '../lib/api'
import type { CalendarSchool, LanguageCode } from '../types/api'

export function useFestivals(year: number, calendar: CalendarSchool, lang: LanguageCode) {
  return useQuery({
    queryKey: ['festivals', year, calendar, lang],
    queryFn: () => fetchFestivals({ year, calendar, lang }),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}

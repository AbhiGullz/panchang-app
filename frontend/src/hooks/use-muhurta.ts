import { useQuery } from '@tanstack/react-query'
import { fetchMuhurta } from '../lib/api'
import type { CalendarSchool, MuhurtaCategory } from '../types/api'

export function useMuhurta(date: string, lat: number, lng: number, tz: string, calendar: CalendarSchool, category: MuhurtaCategory) {
  return useQuery({
    queryKey: ['muhurta', date, lat, lng, tz, calendar, category],
    queryFn: () => fetchMuhurta({ date, lat, lng, tz, calendar, category }),
    staleTime: 1000 * 60 * 10,
  })
}

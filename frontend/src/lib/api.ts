import type { CalendarSchool, FestivalsResponse, GeocodeResult, LanguageCode, MuhurtaCategory, MuhurtaResponse, PanchangResponse } from '../types/api'

const API_BASE = '/api/v1'

async function request<T>(path: string) {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

export function fetchGeocode(query: string, limit = 8) {
  const search = new URLSearchParams({ q: query, limit: String(limit) })
  return request<GeocodeResult[]>(`/geocode?${search.toString()}`)
}

export function fetchReverseGeocode(lat: number, lng: number) {
  const search = new URLSearchParams({ lat: String(lat), lng: String(lng) })
  return request<GeocodeResult>(`/reverse-geocode?${search.toString()}`)
}

export function fetchPanchang(params: {
  date: string
  lat: number
  lng: number
  tz: string
  calendar: CalendarSchool
  lang: LanguageCode
}) {
  const search = new URLSearchParams({
    date: params.date,
    lat: String(params.lat),
    lng: String(params.lng),
    tz: params.tz,
    calendar: params.calendar,
    lang: params.lang,
  })
  return request<PanchangResponse>(`/panchang?${search.toString()}`)
}

export function fetchMuhurta(params: {
  date: string
  lat: number
  lng: number
  tz: string
  calendar: CalendarSchool
  category: MuhurtaCategory
}) {
  const search = new URLSearchParams({
    date: params.date,
    lat: String(params.lat),
    lng: String(params.lng),
    tz: params.tz,
    calendar: params.calendar,
    category: params.category,
  })
  return request<MuhurtaResponse>(`/muhurta?${search.toString()}`)
}

export function fetchFestivals(params: {
  year: number
  calendar: CalendarSchool
  lang: LanguageCode
}) {
  const search = new URLSearchParams({
    year: String(params.year),
    calendar: params.calendar,
    lang: params.lang,
  })
  return request<FestivalsResponse>(`/festivals?${search.toString()}`)
}

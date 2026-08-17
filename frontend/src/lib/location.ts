import { fetchReverseGeocode } from './api'
import type { LanguageCode } from '../types/api'

export async function reverseGeocode(lat: number, lng: number, lang: LanguageCode) {
  const result = await fetchReverseGeocode(lat, lng, lang)
  return {
    city: result.display_name,
    lat: result.lat,
    lng: result.lng,
    tz: result.tz,
  }
}

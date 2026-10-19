import { fetchReverseGeocode } from './api'
import type { LanguageCode } from '../types/api'
import { sankalpaScript } from './sankalpa-script'

export async function reverseGeocode(lat: number, lng: number, lang: LanguageCode) {
  const result = await fetchReverseGeocode(lat, lng, lang)
  return {
    city: sankalpaScript(result.display_name, lang),
    lat,
    lng,
    tz: result.tz,
  }
}

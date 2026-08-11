import { fetchReverseGeocode } from './api'

export async function reverseGeocode(lat: number, lng: number) {
  const result = await fetchReverseGeocode(lat, lng)
  return {
    city: result.display_name,
    lat: result.lat,
    lng: result.lng,
    tz: result.tz,
  }
}

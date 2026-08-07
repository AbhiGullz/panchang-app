const tzMap: Record<string, string> = {
  Delhi: 'Asia/Kolkata',
  Mumbai: 'Asia/Kolkata',
  London: 'Europe/London',
  'New York': 'America/New_York',
  Chennai: 'Asia/Kolkata',
  Bengaluru: 'Asia/Kolkata',
}

export async function reverseGeocode(lat: number, lng: number) {
  const known = [
    { city: 'Delhi', lat: 28.6139, lng: 77.209 },
    { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { city: 'London', lat: 51.5072, lng: -0.1276 },
    { city: 'New York', lat: 40.7128, lng: -74.006 },
  ]

  const nearest = known.reduce((best, current) => {
    const bestDistance = Math.hypot(best.lat - lat, best.lng - lng)
    const currentDistance = Math.hypot(current.lat - lat, current.lng - lng)
    return currentDistance < bestDistance ? current : best
  })

  return {
    city: nearest.city,
    lat,
    lng,
    tz: tzMap[nearest.city] ?? 'Asia/Kolkata',
  }
}

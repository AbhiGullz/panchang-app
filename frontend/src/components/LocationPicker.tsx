import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchGeocode } from '../lib/api'
import type { GeocodeResult, LocationPreference } from '../types/api'

interface Props {
  location: LocationPreference
  onLocationChange: (location: LocationPreference) => void
  onCancel?: () => void
  showCancel?: boolean
}

export function LocationPicker({ location, onLocationChange, onCancel, showCancel = false }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(location.city)
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle')
  const [activeIndex, setActiveIndex] = useState(-1)
  const requestId = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2 || trimmed === location.city) {
      setResults([]); setStatus('idle'); return
    }
    const timer = window.setTimeout(() => {
      const currentRequest = ++requestId.current
      setStatus('loading')
      void fetchGeocode(trimmed).then((next) => {
        if (currentRequest !== requestId.current) return
        setResults(next); setActiveIndex(-1); setStatus(next.length ? 'idle' : 'empty')
      }).catch(() => {
        if (currentRequest === requestId.current) { setResults([]); setStatus('error') }
      })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [location.city, query])

  const selectResult = (result: GeocodeResult) => {
    onLocationChange({ city: result.display_name, lat: result.lat, lng: result.lng, tz: result.tz })
    setQuery(result.display_name); setResults([]); setStatus('idle')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { setResults([]); setActiveIndex(-1); onCancel?.() }
    else if (event.key === 'ArrowDown' && results.length) { event.preventDefault(); setActiveIndex((i) => (i + 1) % results.length) }
    else if (event.key === 'ArrowUp' && results.length) { event.preventDefault(); setActiveIndex((i) => (i - 1 + results.length) % results.length) }
    else if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); if (results[activeIndex]) selectResult(results[activeIndex]) }
  }

  return <div>
    <label className="block text-sm font-medium text-slate-700">
      {t('city')}
      <input aria-autocomplete="list" aria-controls="location-results" aria-expanded={results.length > 0} aria-label={t('searchLocation')} className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3" onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} role="combobox" value={query} />
      {status === 'loading' && <p className="mt-2 text-xs text-slate-500" role="status">{t('searchingLocations')}</p>}
      {status === 'empty' && <p className="mt-2 text-xs text-slate-500" role="status">{t('noLocationsFound')}</p>}
      {status === 'error' && <p className="mt-2 text-xs text-red-600" role="alert">{t('locationSearchError')}</p>}
      {results.length > 0 && <ul className="mt-2 overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-lg" id="location-results" role="listbox">
        {results.map((result, index) => <li key={`${result.display_name}-${result.lat}-${result.lng}`} role="option" aria-selected={activeIndex === index}><button className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50" onClick={() => selectResult(result)} type="button"><span className="block font-medium text-slate-900">{result.display_name}</span><span className="block text-xs text-slate-500">{result.tz}</span></button></li>)}
      </ul>}
    </label>
    {showCancel && <button className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600" onClick={onCancel} type="button">{t('cancel')}</button>}
  </div>
}

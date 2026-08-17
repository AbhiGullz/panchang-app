import { useEffect, useRef, useState } from 'react'
import { MapPin, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_CALENDARS, SUPPORTED_LANGUAGE_OPTIONS } from '../types/api'
import { fetchGeocode } from '../lib/api'
import { humanizeCalendar } from '../lib/utils'
import type { CalendarSchool, GeocodeResult, LanguageCode, LocationPreference } from '../types/api'

interface Props {
  location: LocationPreference
  language: LanguageCode
  calendar: CalendarSchool
  onLocationChange: (location: LocationPreference) => void
  onLanguageChange: (language: LanguageCode) => void
  onCalendarChange: (calendar: CalendarSchool) => void
  onUseCurrentLocation: () => Promise<void>
  onContinue: () => void
}

export function OnboardingCard(props: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(props.location.city)
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle')
  const [activeIndex, setActiveIndex] = useState(-1)
  const requestId = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2 || trimmed === props.location.city) {
      setResults([])
      setStatus('idle')
      return
    }
    const timer = window.setTimeout(() => {
      const currentRequest = ++requestId.current
      setStatus('loading')
      void fetchGeocode(trimmed, props.language).then((nextResults) => {
        if (currentRequest !== requestId.current) return
        setResults(nextResults)
        setActiveIndex(-1)
        setStatus(nextResults.length ? 'idle' : 'empty')
      }).catch(() => {
        if (currentRequest === requestId.current) {
          setResults([])
          setStatus('error')
        }
      })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [props.language, props.location.city, query])

  const selectResult = (result: GeocodeResult) => {
    setQuery(result.display_name)
    setResults([])
    setStatus('idle')
    props.onLocationChange({ city: result.display_name, lat: result.lat, lng: result.lng, tz: result.tz })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setResults([])
      setActiveIndex(-1)
    } else if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      const result = results[activeIndex]
      if (result) selectResult(result)
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('onboardingTitle')}</h1>
          <p className="text-sm text-slate-600">{t('onboardingBody')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          {t('city')}
          <input
            aria-autocomplete="list"
            aria-controls="location-results"
            aria-expanded={results.length > 0}
            aria-label={t('searchLocation')}
            className="mt-1 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            value={query}
          />
          {status === 'loading' && <p className="mt-2 text-xs text-slate-500" role="status">{t('searchingLocations')}</p>}
          {status === 'empty' && <p className="mt-2 text-xs text-slate-500" role="status">{t('noLocationsFound')}</p>}
          {status === 'error' && <p className="mt-2 text-xs text-red-600" role="alert">{t('locationSearchError')}</p>}
          {results.length > 0 && (
            <ul className="mt-2 overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-lg" id="location-results" role="listbox">
              {results.map((result, index) => (
                <li key={`${result.display_name}-${result.lat}-${result.lng}`} role="option" aria-selected={activeIndex === index}>
                  <button
                    className="w-full px-4 py-3 text-left text-sm hover:bg-sky-50"
                    onClick={() => selectResult(result)}
                    type="button"
                  >
                    <span className="block font-medium text-slate-900">{result.display_name}</span>
                    <span className="block text-xs text-slate-500">{result.tz}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </label>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-sky-300 px-4 py-3 text-sm font-medium text-sky-700"
          onClick={() => void props.onUseCurrentLocation()}
          type="button"
        >
          <MapPin className="h-4 w-4" />
          {t('useCurrentLocation')}
        </button>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            {t('calendarSchool')}
            <select
              data-testid="school-selector"
              className="mt-1 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3"
              value={props.calendar}
              onChange={(event) => props.onCalendarChange(event.target.value as CalendarSchool)}
            >
              {SUPPORTED_CALENDARS.map((option) => (
                <option key={option} value={option}>{humanizeCalendar(option, props.language)}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {t('language')}
            <select
              aria-label={t('language')}
              className="mt-1 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3"
              value={props.language}
              onChange={(event) => props.onLanguageChange(event.target.value as LanguageCode)}
            >
              {SUPPORTED_LANGUAGE_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <p className="rounded-2xl bg-sky-50 p-3 text-xs text-slate-600">{t('schoolSelectorHint')}</p>
        <button className="w-full rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white" onClick={props.onContinue} type="button">
          {t('continue')}
        </button>
      </div>
    </section>
  )
}

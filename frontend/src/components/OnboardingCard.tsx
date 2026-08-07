import { MapPin, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_CALENDARS, SUPPORTED_LANGUAGES } from '../types/api'
import { humanizeCalendar } from '../lib/utils'
import type { CalendarSchool, LanguageCode, LocationPreference } from '../types/api'

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

const cityOptions: LocationPreference[] = [
  { city: 'Delhi', lat: 28.6139, lng: 77.209, tz: 'Asia/Kolkata' },
  { city: 'Mumbai', lat: 19.076, lng: 72.8777, tz: 'Asia/Kolkata' },
  { city: 'London', lat: 51.5072, lng: -0.1276, tz: 'Europe/London' },
  { city: 'New York', lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
]

export function OnboardingCard(props: Props) {
  const { t } = useTranslation()

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
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
          <select
            className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
            value={props.location.city}
            onChange={(event) => {
              const next = cityOptions.find((city) => city.city === event.target.value)
              if (next) props.onLocationChange(next)
            }}
          >
            {cityOptions.map((option) => (
              <option key={option.city} value={option.city}>
                {option.city}
              </option>
            ))}
          </select>
        </label>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-orange-300 px-4 py-3 text-sm font-medium text-orange-700"
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
              className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
              value={props.calendar}
              onChange={(event) => props.onCalendarChange(event.target.value as CalendarSchool)}
            >
              {SUPPORTED_CALENDARS.map((option) => (
                <option key={option} value={option}>
                  {humanizeCalendar(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {t('language')}
            <select
              aria-label={t('language')}
              className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
              value={props.language}
              onChange={(event) => props.onLanguageChange(event.target.value as LanguageCode)}
            >
              {SUPPORTED_LANGUAGES.map((option) => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="rounded-2xl bg-orange-50 p-3 text-xs text-slate-600">{t('schoolSelectorHint')}</p>

        <button
          className="w-full rounded-2xl bg-orange-600 px-4 py-3 font-semibold text-white"
          onClick={props.onContinue}
          type="button"
        >
          {t('continue')}
        </button>
      </div>
    </section>
  )
}

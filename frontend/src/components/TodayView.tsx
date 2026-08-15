import { MoonStar, Sunrise, Sunset } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PanchangResponse } from '../types/api'
import { formatDisplayDate, formatTimeWithTimezone } from '../lib/utils'

interface Props {
  data?: PanchangResponse
  calendar: string
  ayanamsa: string
}

function localized(value: string | Record<string, string> | undefined, lang: string) {
  if (!value) return '—'
  return typeof value === 'string' ? value : value[lang] ?? value.en ?? '—'
}

export function TodayView({ data, calendar, ayanamsa }: Props) {
  const { i18n, t } = useTranslation()

  if (!data) {
    return <div className="rounded-3xl bg-white p-6 text-sm text-slate-500">{t('loading')}</div>
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-orange-600 to-amber-500 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between text-sm opacity-90">
          <span>{formatDisplayDate(data.date, i18n.language)}</span>
          <span>{data.location.name}</span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-wide text-orange-100">
              <MoonStar className="h-4 w-4" /> {t('tithi')}
            </div>
            <div className="text-2xl font-semibold">{localized(data.tithi.name, i18n.language)}</div>
            <div className="mt-1 text-sm text-orange-50">{t('nakshatra')}: {localized(data.nakshatra.name, i18n.language)}</div>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm uppercase tracking-wide text-orange-100"><Sunrise className="h-4 w-4" /> {t('sunrise')}</span>
                <span className="text-2xl font-semibold leading-none">{formatTimeWithTimezone(data.sun.rise, data.location.tz, data.date)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm uppercase tracking-wide text-orange-100"><Sunset className="h-4 w-4" /> {t('sunset')}</span>
                <span className="text-2xl font-semibold leading-none">{formatTimeWithTimezone(data.sun.set, data.location.tz, data.date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100">
          <h2 className="text-sm font-semibold text-slate-900">{t('rahuKaal')}</h2>
          <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
            {formatTimeWithTimezone(data.rahu_kaal.start, data.location.tz, data.date)} — {formatTimeWithTimezone(data.rahu_kaal.end, data.location.tz, data.date)}
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <div>{t('moonSign')}: {localized(data.moon_sign, i18n.language)}</div>
            <div>{t('yoga')}: {localized(data.yoga.name, i18n.language)}</div>
            <div>{t('karana')}: {localized(data.karana.name, i18n.language)}</div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100">
          <h2 className="text-sm font-semibold text-slate-900">{t('traditionMeta')}</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between gap-4"><dt>{t('calendarSchool')}</dt><dd>{calendar}</dd></div>
            <div className="flex justify-between gap-4"><dt>{t('ayanamsa')}</dt><dd>{ayanamsa}</dd></div>

            <div className="flex justify-between gap-4"><dt>{t('location')}</dt><dd>{data.location.name}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}

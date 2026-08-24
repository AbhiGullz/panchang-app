import { Sunrise, Sunset } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PanchangLogo } from './PanchangLogo'
import type { PanchangResponse } from '../types/api'
import { formatTimeWithTimezone } from '../lib/utils'

interface Props {
  data?: PanchangResponse
  city?: string
  calendar: string
  ayanamsa: string
}

function localized(value: string | Record<string, string> | undefined, lang: string) {
  if (!value) return '—'
  return typeof value === 'string' ? value : value[lang] ?? value.en ?? '—'
}

function transitionText(
  end: string | null | undefined,
  next: { name: string; at?: string | null } | null | undefined,
  timezone: string,
  date: string,
  language: string,
  t: (key: string) => string,
) {
  const endText = end ? `${t('endsAt')}: ${formatTimeWithTimezone(end, timezone, date, language)}` : t('endTimeUnavailable')
  const nextText = next?.name ? ` · ${t('next')}: ${next.name}` : ''
  return `${endText}${nextText}`
}

export function TodayView({ data, city, calendar, ayanamsa }: Props) {
  const { i18n, t } = useTranslation()

  if (!data) {
    return <div className="rounded-3xl border border-[#D7E7F0] bg-white p-6 text-sm text-[#64748B]">{t('loading')}</div>
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-[#163B63] p-6 text-white shadow-lg">
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-[#0F2747] ring-1 ring-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-wide text-[#B7DDF4]">
              <PanchangLogo className="h-6 w-6" /> {t('tithi')}
            </div>
            <div className="text-2xl font-semibold">{localized(data.tithi.name, i18n.language)}</div>
            <div className="mt-1 text-sm text-[#DDF3FC]">{t('nakshatra')}: {localized(data.nakshatra.name, i18n.language)}</div>
            <div className="mt-2 text-sm text-[#B7DDF4]">{transitionText(data.tithi.end ?? data.tithi.ends_at, data.tithi.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-3xl bg-[#0F2747] ring-1 ring-white/10 p-4 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm uppercase tracking-wide text-[#B7DDF4]"><Sunrise className="h-4 w-4" /> {t('sunrise')}</span>
                <span className="text-2xl font-semibold leading-none">{formatTimeWithTimezone(data.sun.rise_at ?? data.sun.rise, data.location.tz, data.date, i18n.language)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm uppercase tracking-wide text-[#B7DDF4]"><Sunset className="h-4 w-4" /> {t('sunset')}</span>
                <span className="text-2xl font-semibold leading-none">{formatTimeWithTimezone(data.sun.set_at ?? data.sun.set, data.location.tz, data.date, i18n.language)}</span>
              </div>
              {data.sun.moonrise_at ? <div className="flex items-center justify-between gap-3 text-sm text-[#B7DDF4]"><span>{t('moonrise')}</span><span>{formatTimeWithTimezone(data.sun.moonrise_at, data.location.tz, data.date, i18n.language)}</span></div> : null}
              {data.sun.moonset_at ? <div className="flex items-center justify-between gap-3 text-sm text-[#B7DDF4]"><span>{t('moonset')}</span><span>{formatTimeWithTimezone(data.sun.moonset_at, data.location.tz, data.date, i18n.language)}</span></div> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-[#D7E7F0]">
          <h2 className="text-sm font-semibold text-slate-900">{t('rahuKaal')}</h2>
          <div className="mt-3 rounded-2xl bg-[#F5FAFD] px-4 py-3 text-sm font-medium text-[#163B63] ring-1 ring-[#D7E7F0]">
            {formatTimeWithTimezone(data.rahu_kaal.start, data.location.tz, data.date, i18n.language)} — {formatTimeWithTimezone(data.rahu_kaal.end, data.location.tz, data.date, i18n.language)}
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <div>{t('moonSign')}: {localized(data.moon_sign, i18n.language)}</div>
            <div>{t('yoga')}: {localized(data.yoga.name, i18n.language)}</div>
            <div>{t('karana')}: {localized(data.karana.name, i18n.language)}</div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-[#D7E7F0]">
          <h2 className="text-sm font-semibold text-slate-900">{t('traditionMeta')}</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between gap-4"><dt>{t('calendarSchool')}</dt><dd>{calendar}</dd></div>
            <div className="flex justify-between gap-4"><dt>{t('ayanamsa')}</dt><dd>{ayanamsa}</dd></div>

            <div className="flex justify-between gap-4"><dt>{t('location')}</dt><dd>{city || data.location.name}</dd></div>
          </dl>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm border border-[#D7E7F0]">
        <h2 className="font-semibold text-slate-900">{t('panchangDetails')}</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-600">
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('tithi')}: {localized(data.tithi.name, i18n.language)}</div>
            <div className="mt-1">{t('paksha')}: {data.paksha ?? '—'} · {t('month')}: {localized(data.month_name, i18n.language)}</div>
            <div className="mt-1">{transitionText(data.tithi.end ?? data.tithi.ends_at, data.tithi.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('nakshatra')}: {localized(data.nakshatra.name, i18n.language)}</div>
            <div className="mt-1">{transitionText(data.nakshatra.end, data.nakshatra.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('yoga')}: {localized(data.yoga.name, i18n.language)}</div>
            <div className="mt-1">{transitionText(data.yoga.end, data.yoga.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('karana')}: {localized(data.karana.name, i18n.language)}</div>
            <div className="mt-1">{transitionText(data.karana.end, data.karana.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          {data.timing_metadata ? <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">{t('timezone')}: {data.timing_metadata.timezone} · {t('ayanamsa')}: {data.timing_metadata.ayanamsa}</div> : null}
        </div>
      </section>
    </section>
  )
}

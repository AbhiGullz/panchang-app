import { ArrowDown, ArrowUp, CalendarDays, Moon, Sunrise, Sunset } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MoonPhase } from './MoonPhase'
import { PanchangLogo } from './PanchangLogo'
import type { PanchangResponse } from '../types/api'
import { formatDisplayDate, formatTimeWithTimezone, formatWeekday, humanizeAyanamsa, humanizeTimezone } from '../lib/utils'

interface Props {
  data?: PanchangResponse
}

function localized(value: string | object | undefined, lang: string) {
  if (!value) return '—'
  return typeof value === 'string' ? value : (value as Record<string, string>)[lang] ?? (value as Record<string, string>).en ?? '—'
}

const PAKSHA_NAMES: Record<string, Record<string, string>> = {
  shukla: { hi: 'शुक्ल', mr: 'शुक्ल', ta: 'சுக்ல', te: 'శుక్ల', kn: 'ಶುಕ್ಲ', ml: 'ശുക്ല', gu: 'શુક્લ', bn: 'শুক্ল', pa: 'ਸ਼ੁਕਲ' },
  krishna: { hi: 'कृष्ण', mr: 'कृष्ण', ta: 'கிருஷ்ண', te: 'కృష్ణ', kn: 'ಕೃಷ್ಣ', ml: 'കൃഷ്ണ', gu: 'કૃષ્ણ', bn: 'কৃষ্ণ', pa: 'ਕ੍ਰਿਸ਼ਨ' },
}

function pakshaName(value: string, lang: string) {
  return PAKSHA_NAMES[value.toLowerCase()]?.[lang] ?? `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function transitionText(
  end: string | null | undefined,
  next: { name: string | Record<string, string>; at?: string | null } | null | undefined,
  timezone: string,
  date: string,
  language: string,
  t: (key: string) => string,
) {
  const endDate = end?.includes('T') ? end : date
  const endText = end ? `${t('endsAt')}: ${formatDisplayDate(endDate, language)}, ${formatTimeWithTimezone(end, timezone, date, language)}` : t('endTimeUnavailable')
  const nextText = next?.name ? `\n${t('next')}: ${localized(next.name, language)}` : ''
  return `${endText}${nextText}`
}

function MoonEventIcon({ direction }: { direction: 'rise' | 'set' }) {
  const Arrow = direction === 'rise' ? ArrowUp : ArrowDown
  return <span aria-hidden="true" className="relative block h-5 w-5 shrink-0">
    <Moon className="absolute inset-0 h-5 w-5" />
    <Arrow className="absolute -right-1 -top-1 h-2.5 w-2.5 stroke-[3]" />
  </span>
}

export function TodayView({ data }: Props) {
  const { i18n, t } = useTranslation()

  if (!data) {
    return <div className="rounded-3xl border border-[#D7E7F0] bg-white p-6 text-sm text-[#64748B]">{t('loading')}</div>
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-[#163B63] p-5 sm:p-6 text-white shadow-lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-[#0F2747] ring-1 ring-white/10 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]">
              <span className="flex items-center gap-2"><PanchangLogo className="h-8 w-8" /> {t('tithi')}</span>
              <MoonPhase illumination={data.phase?.illumination} elongationDegrees={data.phase?.elongation_degrees} />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-semibold">{localized(data.tithi.name, i18n.language)}</div>
              <div className="mt-2 text-base sm:text-lg text-[#DDF3FC]">{t('moonSign')}: {localized(data.moon_sign, i18n.language)}</div>
              <div className="mt-3 text-base sm:text-lg text-[#DDF3FC]">{t('nakshatra')}: {localized(data.nakshatra.name, i18n.language)}</div>
              <div className="mt-1.5 text-base sm:text-lg text-[#DDF3FC]">{t('month')}: {localized(data.month_name, i18n.language)}</div>
            </div>
          </div>
          <div className="rounded-3xl bg-[#0F2747] ring-1 ring-white/10 p-5 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-base sm:text-lg text-[#DDF3FC]"><CalendarDays className="h-5 w-5" />{formatWeekday(data.date, i18n.language)}</div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]"><Sunrise className="h-6 w-6" /> {t('sunrise')}</span>
                <span className="text-base sm:text-lg font-semibold leading-none">{formatTimeWithTimezone(data.sun.rise_at ?? data.sun.rise, data.location.tz, data.date, i18n.language)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]"><Sunset className="h-6 w-6" /> {t('sunset')}</span>
                <span className="text-base sm:text-lg font-semibold leading-none">{formatTimeWithTimezone(data.sun.set_at ?? data.sun.set, data.location.tz, data.date, i18n.language)}</span>
              </div>
              {data.sun.moonrise_at ? <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]"><MoonEventIcon direction="rise" /> {t('moonrise')}</span><span className="text-base sm:text-lg font-semibold leading-none">{formatTimeWithTimezone(data.sun.moonrise_at, data.location.tz, data.date, i18n.language)}</span></div> : null}
              {data.sun.moonset_at ? <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]"><MoonEventIcon direction="set" /> {t('moonset')}</span><span className="text-base sm:text-lg font-semibold leading-none">{formatTimeWithTimezone(data.sun.moonset_at, data.location.tz, data.date, i18n.language)}</span></div> : null}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm border border-[#D7E7F0]">
        <h2 className="font-semibold text-slate-900">{t('panchangDetails')}</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('month')}: {localized(data.month_name, i18n.language)}</div>
            <div className="mt-1">{t('paksha')}: {data.paksha ? pakshaName(data.paksha, i18n.language) : '—'}</div>
            {data.month_transition ? <div className="mt-1 whitespace-pre-line">{transitionText(data.month_transition.end, data.month_transition.next, data.location.tz, data.date, i18n.language, t)}</div> : null}
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('tithi')}: {localized(data.tithi.name, i18n.language)}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.tithi.end ?? data.tithi.ends_at, data.tithi.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('moonSign')}: {localized(data.moon_sign, i18n.language)}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.moon_sign.end, data.moon_sign.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('nakshatra')}: {localized(data.nakshatra.name, i18n.language)}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.nakshatra.end, data.nakshatra.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('yoga')}: {localized(data.yoga.name, i18n.language)}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.yoga.end, data.yoga.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{t('karana')}: {localized(data.karana.name, i18n.language)}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.karana.end, data.karana.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          {data.timing_metadata ? <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 lg:col-span-2">{t('timezone')}: {humanizeTimezone(data.timing_metadata.timezone, i18n.language)} · {t('ayanamsa')}: {humanizeAyanamsa(data.timing_metadata.ayanamsa, i18n.language)}</div> : null}
        </div>
      </section>
    </section>
  )
}

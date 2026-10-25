import { ArrowDown, ArrowUp, CalendarDays, Moon, Sunrise, Sunset } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MoonPhase } from './MoonPhase'
import { PanchangLogo } from './PanchangLogo'
import { FieldHelp } from './FieldHelp'
import type { FestivalItem, PanchangResponse } from '../types/api'
import { observanceLabels } from '../lib/observance-labels'
import { festivalBasis } from '../lib/festival-basis'
import { formatDisplayDate, formatTimeWithTimezone, formatWeekday, humanizeAyanamsa, humanizeTimezone } from '../lib/utils'

interface Props {
  data?: PanchangResponse
  onGuide?: () => void
  observances?: FestivalItem[]
  tomorrowObservances?: FestivalItem[]
  nextObservance?: FestivalItem
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
function daysUntil(from: string, to: string) { return Math.max(0, Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000)) }

export function TodayView({ data, onGuide, observances = [], tomorrowObservances = [], nextObservance }: Props) {
  const { i18n, t } = useTranslation()
  const help = (key: string) => t(`fieldHelp.${key}`)
  const labelWithHelp = (key: string, label: string, inverse = false) => <FieldHelp explanation={help(key)} inverse={inverse} label={label}>{label}</FieldHelp>
  const valueWithHelp = (key: string, label: string, value: string, inverse = false) => {
    const text = `${label}: ${value}`
    return <FieldHelp explanation={help(key)} inverse={inverse} label={label}>{text}</FieldHelp>
  }

  if (!data) {
    return <div className="rounded-3xl border border-[#D7E7F0] bg-white p-6 text-sm text-[#64748B]">{t('loading')}</div>
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-[#163B63] p-5 sm:p-6 text-white shadow-lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-[#0F2747] ring-1 ring-white/10 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]">
              <span className="flex items-center gap-2"><button type="button" className="cursor-pointer rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400" onClick={onGuide} aria-label="Open Panchang guide"><PanchangLogo className="h-8 w-8" /></button> <span>{labelWithHelp('tithi', t('tithi'), true)}</span></span>
              <MoonPhase illumination={data.phase?.illumination} elongationDegrees={data.phase?.elongation_degrees} />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-semibold">{localized(data.tithi.name, i18n.language)}</div>
              <div className="mt-2 text-base sm:text-lg text-[#DDF3FC]">{valueWithHelp('moonSign', t('moonSign'), localized(data.moon_sign, i18n.language), true)}</div>
              <div className="mt-3 text-base sm:text-lg text-[#DDF3FC]">{valueWithHelp('nakshatra', t('nakshatra'), localized(data.nakshatra.name, i18n.language), true)}</div>
              <div className="mt-1.5 text-base sm:text-lg text-[#DDF3FC]">{valueWithHelp('month', t('month'), localized(data.month_name, i18n.language), true)}</div>
              {observances.length > 0 ? <p className="mt-3 border-t border-white/15 pt-3 text-base text-white"><span className="font-semibold">{observanceLabels(i18n.language)[0]}: </span>{observances.map(item => item.localized_name ?? item.name).join(' · ')}</p> : null}
              {tomorrowObservances.length > 0 ? <p className="mt-2 text-sm text-[#B7DDF4]"><span className="font-semibold">{observanceLabels(i18n.language)[1]}: </span>{tomorrowObservances.map(item => item.localized_name ?? item.name).join(' · ')}</p> : null}
              {nextObservance ? <p className="mt-2 text-sm text-[#B7DDF4]"><span className="font-semibold">{observanceLabels(i18n.language)[9]}: </span>{nextObservance.localized_name ?? nextObservance.name} · {formatDisplayDate(nextObservance.date, i18n.language)} · {daysUntil(data.date, nextObservance.date)} {i18n.language.startsWith('hi') ? 'दिन बाद' : i18n.language.startsWith('ta') ? 'நாட்களில்' : i18n.language.startsWith('te') ? 'రోజుల్లో' : i18n.language.startsWith('kn') ? 'ದಿನಗಳಲ್ಲಿ' : i18n.language.startsWith('ml') ? 'ദിവസത്തിൽ' : i18n.language.startsWith('mr') ? 'दिवसांनी' : 'days'} </p> : null}
              {observances.filter(item => item.selection_note === 'regional-variation').map(item => <p key={item.id ?? item.name} className="mt-1 text-xs text-[#B7DDF4]">{festivalBasis(item, i18n.language)}</p>)}
            </div>
          </div>
          <div className="rounded-3xl bg-[#0F2747] ring-1 ring-white/10 p-5 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-base sm:text-lg text-[#DDF3FC]"><CalendarDays className="h-5 w-5" />{labelWithHelp('weekday', formatWeekday(data.date, i18n.language), true)}</div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]"><Sunrise className="h-6 w-6" /> <span>{labelWithHelp('sunrise', t('sunrise'), true)}</span></span>
                <span className="text-base sm:text-lg font-semibold leading-none">{formatTimeWithTimezone(data.sun.rise_at ?? data.sun.rise, data.location.tz, data.date, i18n.language)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]"><Sunset className="h-6 w-6" /> <span>{labelWithHelp('sunset', t('sunset'), true)}</span></span>
                <span className="text-base sm:text-lg font-semibold leading-none">{formatTimeWithTimezone(data.sun.set_at ?? data.sun.set, data.location.tz, data.date, i18n.language)}</span>
              </div>
              {data.sun.moonrise_at ? <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]"><MoonEventIcon direction="rise" /> <span>{labelWithHelp('moonrise', t('moonrise'), true)}</span></span><span className="text-base sm:text-lg font-semibold leading-none">{formatTimeWithTimezone(data.sun.moonrise_at, data.location.tz, data.date, i18n.language)}</span></div> : null}
              {data.sun.moonset_at ? <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-base sm:text-lg uppercase tracking-wide text-[#B7DDF4]"><MoonEventIcon direction="set" /> <span>{labelWithHelp('moonset', t('moonset'), true)}</span></span><span className="text-base sm:text-lg font-semibold leading-none">{formatTimeWithTimezone(data.sun.moonset_at, data.location.tz, data.date, i18n.language)}</span></div> : null}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm border border-[#D7E7F0]">
        <h2 className="font-semibold text-slate-900">{t('panchangDetails')}</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{valueWithHelp('month', t('month'), localized(data.month_name, i18n.language))}</div>
            <div className="mt-1">{valueWithHelp('paksha', t('paksha'), data.paksha ? pakshaName(data.paksha, i18n.language) : '—')}</div>
            {data.month_transition ? <div className="mt-1 whitespace-pre-line">{transitionText(data.month_transition.end, data.month_transition.next, data.location.tz, data.date, i18n.language, t)}</div> : null}
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{valueWithHelp('tithi', t('tithi'), localized(data.tithi.name, i18n.language))}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.tithi.end ?? data.tithi.ends_at, data.tithi.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{valueWithHelp('moonSign', t('moonSign'), localized(data.moon_sign, i18n.language))}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.moon_sign.end, data.moon_sign.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{valueWithHelp('nakshatra', t('nakshatra'), localized(data.nakshatra.name, i18n.language))}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.nakshatra.end, data.nakshatra.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{valueWithHelp('yoga', t('yoga'), localized(data.yoga.name, i18n.language))}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.yoga.end, data.yoga.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          <div className="rounded-2xl bg-[#F5FAFD] p-4">
            <div className="font-semibold text-slate-900">{valueWithHelp('karana', t('karana'), localized(data.karana.name, i18n.language))}</div>
            <div className="mt-1 whitespace-pre-line">{transitionText(data.karana.end, data.karana.next, data.location.tz, data.date, i18n.language, t)}</div>
          </div>
          {data.timing_metadata ? <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 lg:col-span-2">{labelWithHelp('timezone', t('timezone'))}: {humanizeTimezone(data.timing_metadata.timezone, i18n.language)} · {labelWithHelp('ayanamsa', t('ayanamsa'))}: {humanizeAyanamsa(data.timing_metadata.ayanamsa, i18n.language)}</div> : null}
        </div>
      </section>
    </section>
  )
}

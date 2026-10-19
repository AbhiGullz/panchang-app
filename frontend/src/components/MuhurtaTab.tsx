import { useTranslation } from 'react-i18next'
import type { PanchangResponse, TimeRange } from '../types/api'
import { formatTimeWithTimezone } from '../lib/utils'

interface Props {
  data?: PanchangResponse
}

function timingLabel(t: (key: string) => string, key: string) {
  const labels: Record<string, string> = {
    abhijit: t('abhijitMuhurta'),
    amrit_kala: t('amritKala'),
    rahu_kaal: t('rahuKaal'),
    yamagandam: t('yamagandam'),
    gulika: t('gulikaKaal'),
  }
  return labels[key] ?? key
}

function directionLabel(t: (key: string) => string, direction: string | undefined) {
  const directions: Record<string, string> = {
    north: t('directionNorth'), south: t('directionSouth'), east: t('directionEast'), west: t('directionWest'),
  }
  return directions[direction?.toLowerCase() ?? ''] ?? direction ?? '—'
}

function timingDescription(key: string, t: (key: string, options?: { defaultValue: string }) => string) {
  const descriptions: Record<string, string> = {
    abhijit: 'A midday window traditionally favored for important beginnings.',
    amrit_kala: 'A favorable period traditionally associated with beneficial activities.',
    rahu_kaal: 'A period traditionally avoided for starting auspicious new work.',
    yamagandam: 'A period traditionally avoided for auspicious beginnings.',
    gulika: 'A period used differently by tradition; regional guidance should be followed.',
  }
  return t(`muhurtaDescription.${key}`, { defaultValue: descriptions[key] ?? '' })
}

function DailyTiming({ label, description, value, timezone, date, language }: { label: string; description: string; value: TimeRange; timezone: string; date: string; language: string }) {
  return (
    <div className="flex min-h-32 flex-col justify-center rounded-2xl border border-sky-100 bg-white px-5 py-4">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="mt-1 text-sm text-[#163B63]">
        {formatTimeWithTimezone(value.start_at ?? value.start, timezone, date, language)} — {formatTimeWithTimezone(value.end_at ?? value.end, timezone, date, language)}
      </div>
      <div className="mt-2 text-xs leading-relaxed text-slate-500">{description}</div>
    </div>
  )
}

export function MuhurtaTab({ data }: Props) {
  const { t, i18n } = useTranslation()

  if (!data) {
    return <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100"><p className="text-sm text-slate-500">{t('loading')}</p></section>
  }

  const timings: Array<[string, TimeRange]> = [
    ['abhijit', data.muhurta.abhijit],
    ['amrit_kala', data.muhurta.amrit_kala],
    ['rahu_kaal', data.rahu_kaal],
    ['yamagandam', data.muhurta.yamagandam],
    ['gulika', data.muhurta.gulika],
  ]

  return (
    <section className="min-h-[calc(100vh-10rem)] space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7E7F0]">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t('dailyTimings')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('calculatedReference')}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {timings.map(([key, value]) => <DailyTiming key={key} label={timingLabel(t, key)} description={timingDescription(key, t)} value={value} timezone={data.location.tz} date={data.date} language={i18n.language} />)}
      </div>
      <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-700">
        <span className="font-semibold">{t('dishaShool')}:</span> {directionLabel(t, data.muhurta.disha_shool)}
      </div>
    </section>
  )
}

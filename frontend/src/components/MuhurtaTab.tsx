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

function DailyTiming({ label, value, timezone, date, language }: { label: string; value: TimeRange; timezone: string; date: string; language: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="mt-1 text-sm text-[#163B63]">
        {formatTimeWithTimezone(value.start_at ?? value.start, timezone, date, language)} — {formatTimeWithTimezone(value.end_at ?? value.end, timezone, date, language)}
      </div>
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
    <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7E7F0]">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t('dailyTimings')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('calculatedReference')}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {timings.map(([key, value]) => <DailyTiming key={key} label={timingLabel(t, key)} value={value} timezone={data.location.tz} date={data.date} language={i18n.language} />)}
      </div>
      <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-700">
        <span className="font-semibold">{t('dishaShool')}:</span> {directionLabel(t, data.muhurta.disha_shool)}
      </div>
    </section>
  )
}

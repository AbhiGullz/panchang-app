import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { REGIONS, regionLabel } from '../lib/observance-labels'
import { festivalBasis } from '../lib/festival-basis'
import type { FestivalsResponse } from '../types/api'
import { formatDisplayDate } from '../lib/utils'

interface Props {
  data?: FestivalsResponse
  error?: boolean
}

export function FestivalsTab({ data, error = false }: Props) {
  const { t, i18n } = useTranslation()
  const [region, setRegion] = useState('all')

  return (
    <section className="min-h-[calc(100vh-10rem)] rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100">
      <h2 className="text-lg font-semibold text-slate-900">{t('festivalsForYear')}</h2>
      <select aria-label={regionLabel('all', i18n.language)} value={region} onChange={event => setRegion(event.target.value)} className="mt-3 w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm">
        {REGIONS.map(key => <option key={key} value={key}>{regionLabel(key, i18n.language)}</option>)}
      </select>
      <div className="mt-4 grid min-h-[calc(100vh-16rem)] auto-rows-max gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {error ? <div className="text-sm text-red-600">{t('loading')}</div> : data?.festivals?.filter(item => region === 'all' || item.region === region || item.region === 'pan-India' || item.region === 'personal').map((festival) => (
          <div key={`${festival.date}-${festival.name}`} className="flex min-h-24 flex-col justify-center rounded-2xl border border-sky-100 p-4">
            <div className="font-medium text-slate-900">{festival.localized_name ?? festival.name}</div>
            <div className="text-sm text-slate-600">{formatDisplayDate(festival.date, i18n.language)}</div>
            {festivalBasis(festival, i18n.language) ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{festivalBasis(festival, i18n.language)}</p> : null}
            {festival.localized_notes ?? (i18n.language === 'en' ? festival.notes : undefined) ? <div className="mt-1 text-xs text-slate-500">{festival.localized_notes ?? festival.notes}</div> : null}
          </div>
        )) ?? <div className="text-sm text-slate-500">{t('loading')}</div>}
      </div>
    </section>
  )
}

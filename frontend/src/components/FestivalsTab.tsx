import { useTranslation } from 'react-i18next'
import type { FestivalsResponse } from '../types/api'
import { formatDisplayDate } from '../lib/utils'

interface Props {
  data?: FestivalsResponse
}

export function FestivalsTab({ data }: Props) {
  const { t, i18n } = useTranslation()

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100">
      <h2 className="text-lg font-semibold text-slate-900">{t('festivalsForYear')}</h2>
      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
        {data?.festivals?.map((festival) => (
          <div key={`${festival.date}-${festival.name}`} className="rounded-2xl border border-sky-100 p-4">
            <div className="font-medium text-slate-900">{festival.localized_name ?? festival.name}</div>
            <div className="text-sm text-slate-600">{formatDisplayDate(festival.date, i18n.language)}</div>
            {festival.localized_notes ?? (i18n.language === 'en' ? festival.notes : undefined) ? <div className="mt-1 text-xs text-slate-500">{festival.localized_notes ?? festival.notes}</div> : null}
          </div>
        )) ?? <div className="text-sm text-slate-500">{t('loading')}</div>}
      </div>
    </section>
  )
}

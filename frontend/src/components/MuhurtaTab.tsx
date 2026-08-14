import { useTranslation } from 'react-i18next'
import type { MuhurtaCategory, MuhurtaResponse } from '../types/api'
import { MUHURTA_CATEGORIES } from '../types/api'
import { formatDisplayDate, humanizeMuhurta } from '../lib/utils'

interface Props {
  category: MuhurtaCategory
  onCategoryChange: (category: MuhurtaCategory) => void
  data?: MuhurtaResponse
}

export function MuhurtaTab({ category, onCategoryChange, data }: Props) {
  const { t, i18n } = useTranslation()

  return (
    <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{t('muhurta')}</h2>
        <select
          aria-label={t('muhurta')}
          className="rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as MuhurtaCategory)}
        >
          {MUHURTA_CATEGORIES.map((item) => (
            <option key={item} value={item}>{humanizeMuhurta(item, i18n.language)}</option>
          ))}
        </select>
      </div>

      <p className="rounded-2xl bg-orange-50 p-3 text-sm text-slate-600">{i18n.language === 'mr' ? t('calculatedReference') : (data?.guidance ?? t('calculatedReference'))}</p>

      <div className="space-y-3">
        {data && (data.windows.length === 0 || data.horizon_exhausted) ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{t('muhurtaHorizonEnd')}</div> : null}
        {data?.windows?.map((window, index) => (
          <div key={`${window.start}-${index}`} className="rounded-2xl border border-orange-100 p-4">
            <div className="font-medium text-slate-900">{window.label ?? humanizeMuhurta(category, i18n.language)}</div>
            <div className="text-sm font-medium text-orange-700">{formatDisplayDate(window.date, i18n.language)}</div>
            <div className="text-sm text-slate-600">{window.start} — {window.end}</div>
            {window.reference ? <div className="mt-1 text-xs text-slate-500">{window.reference}</div> : null}
          </div>
        ))}
      </div>
    </section>
  )
}

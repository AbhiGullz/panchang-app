import { useTranslation } from 'react-i18next'

export function AdvertisementSlot() {
  const { t } = useTranslation()

  return (
    <aside aria-label={t('advertisement')} className="rounded-2xl border border-dashed border-orange-200 bg-white/70 px-4 py-5 text-center text-sm text-slate-500">
      <div className="font-medium text-slate-600">{t('advertisement')}</div>
      <div className="mt-1 text-xs">{t('advertisementEmpty')}</div>
    </aside>
  )
}

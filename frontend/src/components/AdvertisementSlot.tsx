import { useTranslation } from 'react-i18next'
import { AdvertisingPreferences } from './AdvertisingPreferences'
import { useAdvertisingConsent } from '../lib/advertising-consent'

export function AdvertisementSlot({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const consent = useAdvertisingConsent()
  if (!import.meta.env.PROD || consent === 'denied') return null
  if (consent !== 'granted') return <AdvertisingPreferences />
  return <aside aria-label={t('advertisement')} className={`flex flex-col items-center gap-2 overflow-hidden ${className}`}>
    <span className="text-xs text-slate-500">{t('advertisement')}</span>
    <iframe title={t('advertisement')} width="300" height="250" className="max-w-full border-0"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin" src={`${import.meta.env.BASE_URL}advertising/banner.html`} />
  </aside>
}

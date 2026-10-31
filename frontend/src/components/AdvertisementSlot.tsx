import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { AdvertisingPreferences } from './AdvertisingPreferences'
import { useAdvertisingConsent } from '../lib/advertising-consent'
import { advertisingCountry, advertisingDecision } from '../lib/advertising-policy'

export function AdvertisementSlot({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const consent = useAdvertisingConsent()
  const { data: country } = useQuery({ queryKey: ['advertising-country'], queryFn: advertisingCountry, enabled: import.meta.env.PROD && !consent, staleTime: Infinity, retry: false })
  const decision = advertisingDecision(consent, country ?? null, (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl)
  if (!import.meta.env.PROD || decision === 'blocked') return null
  if (decision !== 'allowed') return <AdvertisingPreferences />
  return <aside aria-label={t('advertisement')} className={`flex flex-col items-center gap-2 overflow-hidden ${className}`}>
    <span className="text-xs text-slate-500">{t('advertisement')}</span>
    <iframe title={t('advertisement')} width="300" height="250" className="max-w-full border-0"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin" src="https://ads.gajaapanchang.org/advertising/banner.html" />
  </aside>
}

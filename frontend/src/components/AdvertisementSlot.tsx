import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { AdvertisingPreferences } from './AdvertisingPreferences'
import { useAdvertisingConsent } from '../lib/advertising-consent'
import { advertisingCountry, advertisingDecision } from '../lib/advertising-policy'

function subscribeViewport(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}
export function AdvertisementSlot({ className = '', placement = 'bottom' }: { className?: string; placement?: 'bottom' | 'side' }) {
  const { t } = useTranslation()
  const width = useSyncExternalStore(subscribeViewport, () => window.innerWidth, () => 390)
  const consent = useAdvertisingConsent()
  const { data: country } = useQuery({ queryKey: ['advertising-country'], queryFn: advertisingCountry, enabled: import.meta.env.PROD && !consent, staleTime: Infinity, retry: false })
  const decision = advertisingDecision(consent, country ?? null, (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl)
  if (!import.meta.env.PROD || decision === 'blocked') return null
  if (placement === 'side' && width < 1280) return null
  if (decision !== 'allowed') return placement === 'bottom' ? <AdvertisingPreferences /> : null
  const unit = placement === 'side' ? 'side' : width >= 832 ? 'desktop' : 'mobile'
  const dimensions = unit === 'side' ? [160, 600] : unit === 'desktop' ? [728, 90] : [320, 50]
  return <aside aria-label={t('advertisement')} className={`flex flex-col items-center gap-2 overflow-hidden ${className}`}>
    <iframe key={unit} title={t('advertisement')} width={dimensions[0]} height={dimensions[1]} className="max-w-full border-0"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin" src={`https://ads.gajaapanchang.org/advertising/banner.html?unit=${unit}`} />
  </aside>
}

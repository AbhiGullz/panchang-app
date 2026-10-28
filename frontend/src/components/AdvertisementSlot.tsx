import { useTranslation } from 'react-i18next'
import { AdvertisingPreferences } from './AdvertisingPreferences'
import { useAdvertisingConsent } from '../lib/advertising-consent'

// Public ad-unit identifiers supplied by the publisher, not credentials.
export const ADSTERRA_BANNER_DOCUMENT = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;width:300px;height:250px;overflow:hidden}</style></head><body><script>window.atOptions={key:'a8ef1e50997d46e2444461c8209f2948',format:'iframe',height:250,width:300,params:{}};</script><script src="https://bauval.org/22/a8ef1e50997d46e2444461c8209f2948"></script></body></html>`

export function AdvertisementSlot({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const consent = useAdvertisingConsent()
  if (!import.meta.env.PROD || consent === 'denied') return null
  if (consent !== 'granted') return <AdvertisingPreferences />
  return <aside aria-label={t('advertisement')} className={`flex flex-col items-center gap-2 overflow-hidden ${className}`}>
    <span className="text-xs text-slate-500">{t('advertisement')}</span>
    <iframe title={t('advertisement')} width="300" height="250" className="max-w-full border-0"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin" srcDoc={ADSTERRA_BANNER_DOCUMENT} />
  </aside>
}

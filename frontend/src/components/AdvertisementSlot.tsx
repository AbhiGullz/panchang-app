import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  className?: string
  format?: 'horizontal' | 'vertical' | 'rectangle'
}

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export function AdvertisementSlot({ className = '', format = 'horizontal' }: Props) {
  const { t } = useTranslation()
  const initialized = useRef(false)
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined
  const slot = (format === 'vertical' ? import.meta.env.VITE_ADSENSE_VERTICAL_SLOT : import.meta.env.VITE_ADSENSE_CONTENT_SLOT) as string | undefined
  const consentGranted = typeof window !== 'undefined' && window.localStorage.getItem('gajaa-ad-consent') === 'granted'
  const enabled = import.meta.env.PROD && Boolean(client && slot && consentGranted)

  useEffect(() => {
    if (!enabled || initialized.current) return
    initialized.current = true
    if (!document.querySelector('script[data-gajaa-adsense]')) {
      const script = document.createElement('script')
      script.async = true
      script.crossOrigin = 'anonymous'
      script.dataset.gajaaAdsense = 'true'
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client!)}`
      document.head.appendChild(script)
    }
    window.adsbygoogle = window.adsbygoogle || []
    window.adsbygoogle.push({})
  }, [client, enabled])

  if (enabled) {
    return <aside aria-label={t('advertisement')} className={className}>
      <ins className="adsbygoogle block" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  }

  return (
    <aside aria-label={t('advertisement')} className={`rounded-2xl border border-dashed border-[#D7E7F0] bg-white/60 px-4 py-5 text-center text-sm text-[#64748B] ${className}`}>
      <div className="font-medium text-slate-600">{t('advertisement')}</div>
      <div className="mt-1 text-xs">{t('advertisementEmpty')}</div>
    </aside>
  )
}

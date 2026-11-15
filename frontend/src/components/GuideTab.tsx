import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { guideLabel } from '../lib/new-feature-copy'

async function loadGuide() {
  const response = await fetch('/guide.html', { cache: 'no-cache' })
  if (!response.ok) throw new Error('Guide unavailable')
  const document = new DOMParser().parseFromString(await response.text(), 'text/html')
  if (!document.querySelector('main.wrap > article.card > h1')) throw new Error('Guide unavailable')
  document.querySelectorAll('script, iframe, base').forEach(element => element.remove())
  const base = document.createElement('base')
  base.href = 'about:srcdoc'
  document.head.prepend(base)
  const locale = document.createElement('script')
  locale.src = new URL('/document-locales.js', window.location.origin).href
  document.body.append(locale)
  return document
}

export function GuideTab() {
  const { i18n, t } = useTranslation()
  const { data, isError, refetch } = useQuery({ queryKey: ['guide-document'], queryFn: loadGuide, retry: false })
  const guide = data?.documentElement.cloneNode(true) as HTMLElement | undefined
  if (guide) guide.dataset.guideLang = i18n.language
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#D7E7F0]">
      {guide ? <iframe key={i18n.language} title={guideLabel(i18n.language)} srcDoc={`<!doctype html>${guide.outerHTML}`} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="h-[min(78vh,900px)] w-full border-0" />
        : <button className="m-4" type="button" disabled={!isError} onClick={() => void refetch()}>{isError ? t('retry', { defaultValue: 'Retry' }) : t('loading', { defaultValue: 'Loading…' })}</button>}
    </section>
  )
}

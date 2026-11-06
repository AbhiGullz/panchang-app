import { readFileSync } from 'node:fs'
import { afterEach, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

const script = readFileSync('public/document-ads.js', 'utf8')
const key = 'gajaa-adsterra-consent-v1'
afterEach(() => { document.body.innerHTML = ''; localStorage.removeItem(key); vi.unstubAllGlobals(); vi.restoreAllMocks() })
it('uses isolated responsive ads in standalone documents and removes them on withdrawal', async () => {
  vi.stubGlobal('location', { hostname: 'gajaapanchang.org' })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => 'loc=US\n' }))
  document.body.innerHTML = '<main><article>Privacy</article></main>'
  new Function(script)()
  await waitFor(() => expect(document.querySelector('iframe')).not.toBeNull())
  const frame = document.querySelector('iframe')!
  expect(frame.src).toBe('https://ads.gajaapanchang.org/advertising/banner.html?unit=desktop')
  expect(frame.sandbox?.toString() ?? frame.getAttribute('sandbox')).not.toContain('allow-top-navigation')
  expect(frame.referrerPolicy).toBe('strict-origin-when-cross-origin')
  localStorage.setItem(key, 'denied')
  window.dispatchEvent(new Event('gajaa-advertising-consent'))
  expect(document.querySelector('iframe')).toBeNull()
})
it('does not run live ads in development or duplicate them in an embedded guide', () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
  document.body.innerHTML = '<main></main>'
  new Function(script)()
  expect(fetch).not.toHaveBeenCalled()
  new Function('window', script)({ self: {}, top: {} })
  expect(fetch).not.toHaveBeenCalled()
  expect(document.querySelector('iframe')).toBeNull()
})

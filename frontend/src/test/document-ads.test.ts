import { readFileSync } from 'node:fs'
import { afterEach, expect, it, vi } from 'vitest'

const script = readFileSync('public/document-ads.js', 'utf8')
const key = 'gajaa-adsterra-consent-v1'
afterEach(() => { document.body.innerHTML = ''; localStorage.removeItem(key); vi.unstubAllGlobals(); vi.restoreAllMocks() })
it('pauses standalone advertising even with previous consent', () => {
  vi.stubGlobal('location', { hostname: 'gajaapanchang.org' })
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  localStorage.setItem(key, 'granted')
  document.body.innerHTML = '<main><article>Privacy</article></main>'
  new Function(script)()
  expect(fetch).not.toHaveBeenCalled()
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

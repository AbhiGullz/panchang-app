import { readFileSync } from 'node:fs'
import { afterEach, expect, it } from 'vitest'
import { SUPPORTED_LANGUAGES } from '../types/api'

const script = readFileSync('public/document-locales.js', 'utf8')
afterEach(() => { document.body.innerHTML = ''; window.history.replaceState(null, '', '/'); document.documentElement.lang = 'en' })
it('localizes standalone Guide and Privacy in every non-English language', () => {
  for (const language of SUPPORTED_LANGUAGES.filter(x => x !== 'en')) {
    for (const page of ['guide', 'privacy']) {
      window.history.replaceState(null, '', `/${page}.html?lang=${language}`)
      document.body.innerHTML = '<header class="brand"><img alt="Gajaa Panchang"><a href="/">Gajaa Panchang</a></header><article><h1>English reference</h1><p><button id="allow-ads">Allow</button><button id="decline-ads">Decline</button></p><p id="ad-choice"></p></article>'
      new Function(script)()
      expect(document.documentElement.lang).toBe(language)
      expect(document.querySelector('h1')?.textContent).not.toBe('English reference')
      expect(document.querySelectorAll('h2').length).toBeGreaterThanOrEqual(5)
      expect(document.querySelector('.brand a')?.textContent).not.toBe('Gajaa Panchang')
      if (page === 'privacy') {
        expect(document.querySelector('#allow-ads')?.textContent).not.toBe('Allow')
        expect(document.querySelector('#ad-choice')?.textContent).toBeTruthy()
        expect(document.querySelector('a.back')?.getAttribute('href')).toBe('/')
      }
    }
  }
})

import { expect, it } from 'vitest'
import i18n from '../locales/i18n'
import { SUPPORTED_LANGUAGES } from '../types/api'

it('provides an explicit Privacy policy label for every Settings language', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    await i18n.changeLanguage(language)
    expect(i18n.exists('privacy', { lng: language, fallbackLng: false })).toBe(true)
    if (language !== 'en') expect(i18n.t('privacy')).not.toBe('Privacy policy')
  }
  await i18n.changeLanguage('en')
})

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { BottomNav } from '../components/BottomNav'
import i18n from '../locales/i18n'

const expectedHomeLabels = {
  en: 'Home',
  hi: 'मुख्य पृष्ठ',
  mr: 'मुख्यपृष्ठ',
  ta: 'முகப்பு',
  te: 'ప్రధాన పేజీ',
  kn: 'ಮುಖ್ಯ ಪುಟ',
  ml: 'പ്രധാന പേജ്',
  gu: 'મુખ્ય પૃષ્ઠ',
  bn: 'মূল পৃষ্ঠা',
  pa: 'ਮੁੱਖ ਪੰਨਾ',
} as const

afterEach(() => {
  cleanup()
})

describe('bottom navigation localization', () => {
  it('renders the natural home label for each supported locale', async () => {
    for (const [language, label] of Object.entries(expectedHomeLabels)) {
      await i18n.changeLanguage(language)
      render(<BottomNav activeTab="today" onTabChange={() => undefined} />)

      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: i18n.t('muhurta') })).not.toBeInTheDocument()
      cleanup()
    }
  })
})

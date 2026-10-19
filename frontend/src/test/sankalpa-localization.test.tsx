import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import i18n from '../locales/i18n'
import { SUPPORTED_LANGUAGES, type PanchangResponse } from '../types/api'
import { optionIds, optionLabels, sankalpaOption, sankalpaSentence } from '../lib/sankalpa-locales'
import { sankalpaScript, sanskritDuration } from '../lib/sankalpa-script'
import { SankalpaTab } from '../components/SankalpaTab'

const names = { en: 'Ashwin', hi: 'आश्विन', mr: 'आश्विन', ta: 'ஐப்பசி', te: 'ఆశ్వయుజ', kn: 'ಆಶ್ವಯುಜ', ml: 'ആശ്വിനം', gu: 'આસો', bn: 'আশ্বিন', pa: 'ਅੱਸੂ' }
const data: PanchangResponse = {
  date: '2026-10-18', location: { name: 'Flemington', lat: 40.51, lng: -74.85, tz: 'America/New_York' },
  sun: { rise: '07:00', set: '18:00' }, tithi: { index: 7, name: names }, nakshatra: { index: 20, name: names, pada: 1 },
  yoga: { index: 1, name: names }, karana: { index: 1, name: names }, moon_sign: names, month_name: names, paksha: 'shukla',
  rahu_kaal: { start: '16:00', end: '18:00' }, names_version: 'test', source: 'test',
} as PanchangResponse

afterEach(async () => { cleanup(); await i18n.changeLanguage('en') })

describe('Sankalpa catalogue completeness', () => {
  it.each(SUPPORTED_LANGUAGES)('renders every ritual × purpose × deity × duration combination in %s', (language) => {
    const base = { date: '18', weekday: 'DAY', month: 'MONTH', paksha: 'PAKSHA', tithi: 'TITHI', nakshatra: 'STAR', location: 'LOCATION', name: 'PERSON', gotra: 'GOTRA', residence: 'HOME', family: '', count: '31000', alone: 'yes', gender: 'female' }
    let checked = 0
    for (const gender of ['male', 'female', 'neutral'])
      for (const alone of ['yes', 'no'])
        for (const ritual of optionLabels[language].ritual.split('|'))
      for (const purpose of optionLabels[language].purpose.split('|'))
        for (const deity of optionLabels[language].deity.split('|'))
          for (const duration of optionLabels[language].duration.split('|')) {
            const sentence = sankalpaSentence(language, { ...base, gender, alone, ritual, purpose, deity, duration })
            if (!sentence.includes(ritual) || !sentence.includes(purpose) || !sentence.includes(deity) || !sentence.includes(duration) || !sentence.includes('31000') || /undefined|\(\)|,\s*,|करता\/करती/.test(sentence) || sentence.split('LOCATION').length !== 2) {
              throw new Error(`Invalid ${language}: ${ritual}/${purpose}/${deity}/${duration}`)
            }
            checked++
          }
    expect(checked).toBe(31 * 16 * 14 * 9 * 3 * 2)
  }, 30000)
  it.each(SUPPORTED_LANGUAGES)('has every dropdown value in %s with no English or Sanskrit fallback', (language) => {
    for (const group of Object.keys(optionIds) as Array<keyof typeof optionIds>) {
      const ids = optionIds[group].split('|')
      expect(optionLabels[language][group].split('|')).toHaveLength(ids.length)
      for (const id of ids) {
        const label = sankalpaOption(language, group, id)
        expect(label.length).toBeGreaterThan(0)
        expect(i18n.getFixedT(language)(`sankalpaOptions.${group}.${id}`)).toBe(label)
        if (language !== 'en') expect(label).not.toMatch(/[a-z]/i)
        if (language === 'ta') expect(label).not.toMatch(/[\u0900-\u097f]/)
      }
    }
  })

  it('keeps all rendered options localized when switching Tamil → Hindi → Tamil', async () => {
    await i18n.changeLanguage('ta')
    const { container } = render(<SankalpaTab data={data} selectedDate="2026-10-18" locationName="Flemington, New Jersey, United States" />)
    for (const language of ['ta', 'hi', 'ta']) {
      await i18n.changeLanguage(language)
      for (const option of container.querySelectorAll('option')) {
        expect(option.textContent).not.toMatch(/[a-z]/i)
        if (language === 'ta') expect(option.textContent).not.toMatch(/[\u0900-\u097f]/)
      }
    }
  })
})

describe('personalized Sankalpa', () => {
  it('places the Sanskrit motive after the deity, removes repeated location, and uses selected gender', async () => {
    await i18n.changeLanguage('hi')
    const { container } = render(<SankalpaTab data={data} selectedDate="2026-10-18" locationName="Flemington, New Jersey, United States" />)
    const change = (selector: string, value: string) => fireEvent.change(container.querySelector(selector)!, { target: { value } })
    change('[name="gender"]', 'female')
    change('[name="participation"]', 'alone')
    const selects = container.querySelectorAll('select')
    fireEvent.change(selects[2]!, { target: { value: 'sadhana' } })
    fireEvent.change(selects[3]!, { target: { value: 'other' } })
    change('[name="otherPurpose"]', 'प्रेमिका के रूप मे प्राप्त करने के लिये')
    change('[name="temporaryAddress"]', 'Pune, Maharashtra, India')
    const paragraphs = [container.querySelector('[data-testid="sanskrit-output"]')!.textContent!, container.querySelector('[data-testid="local-output"]')!.textContent!]
    expect(paragraphs[0]).toContain('इष्टदेवता प्रीत्यर्थं प्रेमिकारूपेण प्राप्त्यर्थम्')
    expect(paragraphs[0]).not.toContain('प्राप्त करने')
    expect(paragraphs[0]).toContain('अस्मिन् प्रयोगे मम पूर्णसफलताप्राप्त्यर्थम् आशीर्वादं प्रयच्छन्तु।')
    expect(paragraphs[1]).toContain('प्रेमिका के रूप में प्राप्त करने के लिए')
    expect(paragraphs[1]).toContain('मुझे इस प्रयोग में पूर्ण सफलता प्राप्त हो')
    expect(paragraphs[0]!.match(/पुणे/g)).toHaveLength(1)
    expect(paragraphs[1]).toContain('साधना करने का संकल्प करती हूँ')
    expect(paragraphs[1]).not.toMatch(/के लिये के लिए|अकेले|यहाँ बैठकर|समर्पित/)
    change('[name="gender"]', 'male')
    expect(container.textContent).toContain('साधना करने का संकल्प करता हूँ')
  })
  it('distinguishes residence and ritual address without injecting a country or generic motive', async () => {
    await i18n.changeLanguage('hi')
    const { container } = render(<SankalpaTab data={data} selectedDate="2026-10-18" locationName="Delhi, India" />)
    const set = (name: string, value: string) => fireEvent.change(container.querySelector(`[name="${name}"]`)!, { target: { value } })
    set('address', 'Flemington, New Jersey, United States')
    set('temporaryAddress', 'Pune, Maharashtra, India')
    const paragraphs = () => [container.querySelector('[data-testid="sanskrit-output"]')!.textContent!, container.querySelector('[data-testid="local-output"]')!.textContent!]
    expect(paragraphs()[0]).toContain('स्थायिनिवासस्थाननिवासिनः')
    expect(paragraphs()[0]).toContain('उपविश्य')
    expect(paragraphs()[0]).not.toContain('क्षेम-स्थैर्य')
    expect(paragraphs()[1]).toContain('स्थायी निवासी')
    expect(paragraphs()[1]).not.toContain('यहाँ बैठकर')
    set('temporaryAddress', 'Flemington, New Jersey, United States')
    expect(paragraphs()[0]).toContain('अमेरिकाखण्डे')
    expect(paragraphs()[0]).not.toContain('भारत देशे')
    expect(paragraphs()[0]).toContain('उपविश्य')
    expect(paragraphs()[1]).not.toContain('यहाँ बैठकर')
    expect(paragraphs()[0]).not.toContain('स्थायिनिवासस्थाननिवासिनः')
    expect(paragraphs()[1]).not.toContain('स्थायी निवासी')
    set('temporaryAddress', '')
    expect(paragraphs()[0]!.match(/फ्लेमिंग्टन/g)).toHaveLength(1)
    expect(paragraphs()[1]!.match(/फ्लेमिंग्टन/g)).toHaveLength(1)
  })
  it('uses the address, names, native japa count and family in both single-paragraph versions', async () => {
    await i18n.changeLanguage('hi')
    const { container } = render(<SankalpaTab data={data} selectedDate="2026-10-18" locationName="Flemington, New Jersey, United States" />)
    for (const [name, value] of Object.entries({ name: 'Abhishek', gotra: 'Kashyap', father: 'Mohan', mother: 'Lataa', spouse: 'Meeraa', count: '36000', address: '1 Example Road, Flemington, NJ 00000' })) {
      fireEvent.change(container.querySelector(`[name="${name}"]`)!, { target: { value } })
    }
    const paragraphs = [container.querySelector('[data-testid="sanskrit-output"]')!.textContent!, container.querySelector('[data-testid="local-output"]')!.textContent!]
    expect(paragraphs).toHaveLength(2)
    for (const paragraph of paragraphs) {
      for (const word of ['अभिषेक', 'कश्यप', 'मोहन', 'लता', 'मीरा', '३६०००', 'एक्सम्प्ले', 'फ्लेमिंग्टन']) expect(paragraph).toContain(word)
      expect(paragraph).not.toMatch(/[a-z]/i)
    }
    expect(paragraphs[0]).toContain('अमेरिकाखण्डे')
    expect(paragraphs[0]).toContain('ॐ विष्णुर्विष्णुर्विष्णुः')
    expect(paragraphs[0]).toContain('फ्लेमिंग्टन, न्यू जर्सी ००००० स्थाने')
    expect(paragraphs[0]).toContain('सकुटुम्बस्य')
    expect(paragraphs[1]).toContain('ॐ विष्णुर्विष्णुर्विष्णुः')
    expect(paragraphs[1]).toContain('अपने सम्पूर्ण परिवार के साथ')
    expect(paragraphs[1]).toContain('एक दिन')
    expect(paragraphs[1]).toContain('दैनिक पूजा')
    expect(container.querySelector('[name="name"]')).toHaveValue('अभिषेक')
    const participation = container.querySelector('[name="participation"]')!
    fireEvent.change(participation, { target: { value: 'alone' } })
    const updated = [container.querySelector('[data-testid="sanskrit-output"]')!.textContent!, container.querySelector('[data-testid="local-output"]')!.textContent!]
    expect(updated[0]).not.toContain('सकुटुम्बस्य')
    expect(updated[1]).not.toContain('अकेले')
  })

  it('preserves exact native spelling and renders requested scripts and numbers offline', () => {
    expect(sankalpaScript('அபிஷேக்', 'ta')).toBe('அபிஷேக்')
    expect(sankalpaScript('Abhishek', 'hi')).toBe('अभिषेक')
    expect(sankalpaScript('Abhishek', 'ta')).toBe('அபிஷேக்')
    expect(sankalpaScript('36000', 'hi')).toBe('३६०००')
    expect(sankalpaScript('36000', 'ta')).toBe('௩௬௦௦௦')
    expect(sanskritDuration('1 mahina')).toBe('एकमासपर्यन्तम्')
    expect(sanskritDuration('१ महीना')).toBe('एकमासपर्यन्तम्')
  })

  it('keeps original spelling when changing script and clears personal inputs on leaving the tab', async () => {
    await i18n.changeLanguage('hi')
    const props = { data, selectedDate: '2026-10-18', locationName: 'Flemington, New Jersey, United States' }
    const first = render(<SankalpaTab {...props} />)
    const input = first.container.querySelector('[name="name"]')!
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Abhishek' } })
    expect(input).toHaveValue('Abhishek')
    fireEvent.blur(input)
    expect(input).toHaveValue('अभिषेक')
    await i18n.changeLanguage('ta')
    expect(input).toHaveValue('அபிஷேக்')
    await i18n.changeLanguage('hi')
    expect(input).toHaveValue('अभिषेक')
    first.unmount()
    const second = render(<SankalpaTab {...props} />)
    expect(second.container.querySelector('[name="name"]')).toHaveValue('')
  })
})

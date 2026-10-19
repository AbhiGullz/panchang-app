import type { LanguageCode } from '../types/api'

const starts: Partial<Record<LanguageCode, number>> = { hi: 0x900, mr: 0x900, bn: 0x980, pa: 0xa00, gu: 0xa80, ta: 0xb80, te: 0xc00, kn: 0xc80, ml: 0xd00 }
const words: Record<string, string> = {
  abhishek: 'अभिषेक', kashyap: 'कश्यप', kashyapa: 'कश्यप', pradyumna: 'प्रद्युम्न', kalpana: 'कल्पना', komal: 'कोमल', mitra: 'मित्र', gandharv: 'गन्धर्व', gandharva: 'गन्धर्व',
  flemington: 'फ्लेमिंग्टन', new: 'न्यू', jersey: 'जर्सी', nj: 'न्यू जर्सी', america: 'अमेरिका', usa: 'अमेरिका', united: 'यूनाइटेड', states: 'स्टेट्स', india: 'भारत', delhi: 'दिल्ली', stratton: 'स्ट्रैटन', court: 'कोर्ट', mahina: 'महीना', month: 'महीना', months: 'महीने', day: 'दिन', days: 'दिन',
}
const tamilNames: Record<string, string> = {
  abhishek: 'அபிஷேக்', kashyap: 'காஷ்யப்', kashyapa: 'காஷ்யப', pradyumna: 'பிரத்யும்னா', kalpana: 'கல்பனா', komal: 'கோமல்', mitra: 'மித்ரா', gandharv: 'கந்தர்வ', gandharva: 'கந்தர்வ',
}
const consonants: Record<string, string> = { kh: 'ख', gh: 'घ', chh: 'छ', ch: 'च', jh: 'झ', th: 'थ', dh: 'ध', ph: 'फ', bh: 'भ', sh: 'श', k: 'क', g: 'ग', c: 'क', j: 'ज', t: 'त', d: 'द', n: 'न', p: 'प', b: 'ब', m: 'म', y: 'य', r: 'र', l: 'ल', v: 'व', w: 'व', s: 'स', h: 'ह', f: 'फ', z: 'ज', q: 'क', x: 'क्स' }
const vowels: Record<string, [string, string]> = { aa: ['आ', 'ा'], ai: ['ऐ', 'ै'], au: ['औ', 'ौ'], ee: ['ई', 'ी'], ii: ['ई', 'ी'], oo: ['ऊ', 'ू'], uu: ['ऊ', 'ू'], a: ['अ', ''], i: ['इ', 'ि'], u: ['उ', 'ु'], e: ['ए', 'े'], o: ['ओ', 'ो'] }

export function sanskritDuration(value: string) {
  const normalized = value.replace(/[०-९]/g, (char) => String(char.charCodeAt(0) - 0x966)).trim()
  const match = /^(\d+)\s*(mahina|mahine|month|months|महीना|महीने|मास|day|days|din|दिन|week|weeks|सप्ताह|year|years|वर्ष)$/i.exec(normalized)
  if (!match) return `${sankalpaScript(value, 'hi')} कालपर्यन्तम्`
  const quantity = Number(match[1])
  const unit = /mah|month|मही|मास/i.test(match[2]!) ? 'मास' : /week|सप्ताह/i.test(match[2]!) ? 'सप्ताह' : /year|वर्ष/i.test(match[2]!) ? 'वर्ष' : 'दिन'
  return `${quantity === 1 ? 'एक' : sankalpaScript(String(quantity), 'hi')}${unit}पर्यन्तम्`
}

function romanWord(word: string) {
  const lower = word.toLowerCase()
  if (words[lower]) return words[lower]
  const tokens = lower.match(/chh|kh|gh|ch|jh|th|dh|ph|bh|sh|aa|ai|au|ee|ii|oo|uu|[a-z]/g) ?? []
  return tokens.map((token, index) => {
    const vowel = vowels[token]
    if (vowel) return consonants[tokens[index - 1] ?? ''] ? vowel[1] : vowel[0]
    const consonant = consonants[token]
    return consonant ? consonant + (consonants[tokens[index + 1] ?? ''] ? '्' : '') : ''
  }).join('')
}

// Offline phonetic script conversion, not semantic translation. Keep the result editable.
export function sankalpaScript(value: string, language: LanguageCode): string {
  if (language === 'en') return value
  if (language === 'ta') value = value.replace(/[A-Za-z]+/g, (word) => tamilNames[word.toLowerCase()] ?? word)
  const target = starts[language] ?? 0x900
  // Preserve already-native spelling. Only convert spans from a different script.
  const nativeSpans = value.split(new RegExp(`([\\u${target.toString(16).padStart(4, '0')}-\\u${(target + 127).toString(16).padStart(4, '0')}]+)`, 'u'))
  if (nativeSpans.length > 1) return nativeSpans.map((span) => {
    const point = span.codePointAt(0)
    return point !== undefined && point >= target && point < target + 128 ? span : sankalpaScript(span, language)
  }).join('')
  let devanagari = Array.from(value).map((char) => {
    const point = char.codePointAt(0)!
    for (const start of [0x980, 0xa00, 0xa80, 0xb80, 0xc00, 0xc80, 0xd00]) {
      if (point >= start && point <= start + 0x7f) return String.fromCodePoint(point - start + 0x900)
    }
    return char
  }).join('').replace(/[A-Za-z]+/g, romanWord)
  const start = starts[language] ?? 0x900
  // Tamil shares the Indic layout but does not distinguish the voiced/aspirated stops.
  if (language === 'ta') devanagari = devanagari.replace(/[खगघ]/g, 'क').replace(/छ/g, 'च').replace(/झ/g, 'ज').replace(/[ठडढ]/g, 'ट').replace(/[थदध]/g, 'त').replace(/[फबभ]/g, 'प').replace(/ऋ/g, 'रि').replace(/ृ/g, '्रि').replace(/ं/g, 'म्').replace(/ँ/g, 'म्')
  return Array.from(devanagari).map((char) => {
    const point = char.codePointAt(0)!
    if (point >= 0x900 && point <= 0x97f) return String.fromCodePoint(point - 0x900 + start)
    if (/[0-9]/.test(char)) return String.fromCodePoint(start + 0x66 + Number(char))
    return char
  }).join('')
}

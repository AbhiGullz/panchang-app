import type { LanguageCode } from '../types/api'

// Date labels describe the selected date, not the device's current date.
const labels: Record<LanguageCode, string[]> = {
  en: ['Observances', 'Tomorrow', 'All traditions', 'Maharashtra', 'Tamil Nadu', 'Andhra / Karnataka / Telangana', 'North India', 'Kerala', 'Punjab', 'Next observance'],
  hi: ['पर्व व व्रत', 'कल', 'सभी परंपराएँ', 'महाराष्ट्र', 'तमिलनाडु', 'आंध्र / कर्नाटक / तेलंगाना', 'उत्तर भारत', 'केरल', 'पंजाब', 'अगला पर्व'],
  mr: ['सण व व्रते', 'उद्या', 'सर्व परंपरा', 'महाराष्ट्र', 'तामिळनाडू', 'आंध्र / कर्नाटक / तेलंगणा', 'उत्तर भारत', 'केरळ', 'पंजाब', 'पुढील सण'],
  ta: ['விழாக்கள் மற்றும் விரதங்கள்', 'நாளை', 'அனைத்து மரபுகள்', 'மகாராஷ்டிரா', 'தமிழ்நாடு', 'ஆந்திரா / கர்நாடகா / தெலங்கானா', 'வட இந்தியா', 'கேரளா', 'பஞ்சாப்', 'அடுத்த விழா'],
  te: ['పండుగలు మరియు వ్రతాలు', 'రేపు', 'అన్ని సంప్రదాయాలు', 'మహారాష్ట్ర', 'తమిళనాడు', 'ఆంధ్ర / కర్ణాటక / తెలంగాణ', 'ఉత్తర భారతదేశం', 'కేరళ', 'పంజాబ్'],
  kn: ['ಹಬ್ಬಗಳು ಮತ್ತು ವ್ರತಗಳು', 'ನಾಳೆ', 'ಎಲ್ಲ ಸಂಪ್ರದಾಯಗಳು', 'ಮಹಾರಾಷ್ಟ್ರ', 'ತಮಿಳುನಾಡು', 'ಆಂಧ್ರ / ಕರ್ನಾಟಕ / ತೆಲಂಗಾಣ', 'ಉತ್ತರ ಭಾರತ', 'ಕೇರಳ', 'ಪಂಜಾಬ್'],
  ml: ['ഉത്സവങ്ങളും വ്രതങ്ങളും', 'നാളെ', 'എല്ലാ പാരമ്പര്യങ്ങളും', 'മഹാരാഷ്ട്ര', 'തമിഴ്നാട്', 'ആന്ധ്ര / കർണാടക / തെലങ്കാന', 'ഉത്തരേന്ത്യ', 'കേരളം', 'പഞ്ചാബ്'],
  gu: ['તહેવારો અને વ્રતો', 'આવતીકાલે', 'બધી પરંપરાઓ', 'મહારાષ્ટ્ર', 'તમિલનાડુ', 'આંધ્ર / કર્ણાટક / તેલંગાણા', 'ઉત્તર ભારત', 'કેરળ', 'પંજાબ'],
  bn: ['উৎসব ও ব্রত', 'আগামীকাল', 'সব পরম্পরা', 'মহারাষ্ট্র', 'তামিলনাড়ু', 'অন্ধ্র / কর্ণাটক / তেলেঙ্গানা', 'উত্তর ভারত', 'কেরল', 'পাঞ্জাব'],
  pa: ['ਤਿਉਹਾਰ ਅਤੇ ਵਰਤ', 'ਭਲਕੇ', 'ਸਾਰੀਆਂ ਪਰੰਪਰਾਵਾਂ', 'ਮਹਾਰਾਸ਼ਟਰ', 'ਤਮਿਲਨਾਡੂ', 'ਆਂਧਰਾ / ਕਰਨਾਟਕ / ਤੇਲੰਗਾਨਾ', 'ਉੱਤਰੀ ਭਾਰਤ', 'ਕੇਰਲ', 'ਪੰਜਾਬ'],
}
export const REGIONS = ['all', 'maharashtra', 'tamil-nadu', 'andhra-karnataka-telangana', 'north-india', 'kerala', 'punjab'] as const
const nextLabels: Record<string, string> = { te: 'తదుపరి పండుగ', kn: 'ಮುಂದಿನ ಹಬ್ಬ', ml: 'അടുത്ത ഉത്സവം', gu: 'આગામી તહેવાર', bn: 'পরবর্তী উৎসব', pa: 'ਅਗਲਾ ਤਿਉਹਾਰ' }
export function observanceLabels(language: string) {
  language = language.split('-')[0] ?? language
  const base = labels[language as LanguageCode] ?? labels.en
  return base.length > 9 ? base : [...base, nextLabels[language] ?? labels.en[9]]
}
export function regionLabel(region: string, language: string) {
  const index = REGIONS.indexOf(region as typeof REGIONS[number])
  return observanceLabels(language)[index < 0 ? 2 : index + 2]
}

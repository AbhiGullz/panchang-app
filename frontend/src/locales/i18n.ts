import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appName: 'Panchang',
      onboardingTitle: 'Set your daily defaults',
      onboardingBody: 'Choose your city, calendar school, and language. You can change them later in settings.',
      useCurrentLocation: 'Use current location',
      continue: 'Continue',
      today: 'Today',
      muhurta: 'Muhurta',
      festivals: 'Festivals',
      settings: 'Settings',
      dateLabel: 'Date',
      language: 'Language',
      calendarSchool: 'Calendar school',
      notificationTime: 'Notification time',
      ayanamsa: 'Ayanamsa',
      howCalculated: 'How this was calculated',
      traditionMeta: 'Tradition',
      timezone: 'Timezone',
      location: 'Location',
      version: 'Version',
      offlineReady: 'Offline cache ready for the last 7 days.',
      calculatedReference: 'Calculated timing reference only.',
      festivalsForYear: 'Festival calendar',
      save: 'Save',
      geolocationDenied: 'Location permission denied. Using Delhi fallback.',
      city: 'City',
      schoolSelectorHint: 'Names come from backend; UI chrome changes here instantly.',
      pushNotifications: 'Push notifications',
      subscribe: 'Subscribe',
      subscribed: 'Subscribed',
      tithi: 'Tithi',
      nakshatra: 'Nakshatra',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
      rahuKaal: 'Rahu Kaal',
      moonSign: 'Moon sign',
      yoga: 'Yoga',
      karana: 'Karana',
      loading: 'Loading…',
      noData: 'No data available offline yet.',
    },
  },
  hi: { translation: { appName: 'पंचांग', onboardingTitle: 'दैनिक डिफ़ॉल्ट चुनें', continue: 'आगे बढ़ें', today: 'आज', muhurta: 'मुहूर्त', festivals: 'पर्व', settings: 'सेटिंग्स', language: 'भाषा', calendarSchool: 'पंचांग परंपरा', location: 'स्थान', save: 'सेव करें', loading: 'लोड हो रहा है…' } },
  pa: { translation: { appName: 'ਪੰਚਾਂਗ', today: 'ਅੱਜ', muhurta: 'ਮੁਹੂਰਤ', festivals: 'ਤਿਉਹਾਰ', settings: 'ਸੈਟਿੰਗਾਂ', language: 'ਭਾਸ਼ਾ', save: 'ਸੰਭਾਲੋ' } },
  ta: { translation: { appName: 'பஞ்சாங்கம்', today: 'இன்று', muhurta: 'முஹூர்த்தம்', festivals: 'திருவிழாக்கள்', settings: 'அமைப்புகள்', language: 'மொழி', save: 'சேமிக்க' } },
  te: { translation: { appName: 'పంచాంగం', today: 'ఈ రోజు', muhurta: 'ముహూర్తం', festivals: 'పండుగలు', settings: 'అమరికలు', language: 'భాష', save: 'సేవ్' } },
  kn: { translation: { appName: 'ಪಂಚಾಂಗ', today: 'ಇಂದು', muhurta: 'ಮುಹೂರ್ತ', festivals: 'ಹಬ್ಬಗಳು', settings: 'ಸೆಟ್ಟಿಂಗ್ಗಳು', language: 'ಭಾಷೆ', save: 'ಉಳಿಸಿ' } },
  ml: { translation: { appName: 'പഞ്ചാംഗം', today: 'ഇന്ന്', muhurta: 'മുഹൂർത്തം', festivals: 'ഉത്സവങ്ങൾ', settings: 'ക്രമീകരണങ്ങൾ', language: 'ഭാഷ', save: 'സേവ്' } },
  mr: { translation: { appName: 'पंचांग', today: 'आज', muhurta: 'मुहूर्त', festivals: 'सण', settings: 'सेटिंग्ज', language: 'भाषा', save: 'जतन करा' } },
  gu: { translation: { appName: 'પંચાંગ', today: 'આજ', muhurta: 'મુહૂર્ત', festivals: 'ઉત્સવો', settings: 'સેટિંગ્સ', language: 'ભાષા', save: 'સેવ કરો' } },
  bn: { translation: { appName: 'পঞ্চাঙ্গ', today: 'আজ', muhurta: 'মুহূর্ত', festivals: 'উৎসব', settings: 'সেটিংস', language: 'ভাষা', save: 'সেভ করুন' } },
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n

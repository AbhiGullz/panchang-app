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
      home: 'Home',
      muhurta: 'Muhurta',
      festivals: 'Festivals',
      settings: 'Settings',
      dateLabel: 'Date',
      selectDate: 'Select date',
      language: 'Language',
      calendarSchool: 'Calendar school',
      notificationTime: 'Notification time',
      ayanamsa: 'Ayanamsa',
      howCalculated: 'How this was calculated',
      traditionMeta: 'Tradition',
      timezone: 'Timezone',
      location: 'Location',
      version: 'Version',
      calculatedReference: 'Calculated timing reference only.',
      muhurtaHorizonEnd: 'No more available muhurta windows were found in the supported horizon.',
      retry: 'Retry',
      details: 'Technical details',
      coordinates: 'Coordinates',
      advertisement: 'Advertisement',
      advertisementEmpty: 'Reserved for a compliant, consent-ready provider.',
      festivalsForYear: 'Festival calendar',
      save: 'Save',
      geolocationDenied: 'Location permission denied. Using Delhi fallback.',
      city: 'City',
      changeLocation: 'Change location',
      changeLocationTitle: 'Search for a new location',
      cancel: 'Cancel',
      searchLocation: 'Search worldwide locations',
      searchingLocations: 'Searching locations…',
      noLocationsFound: 'No locations found.',
      locationSearchError: 'Location search is unavailable. Try again.',
      schoolSelectorHint: 'Names come from backend; UI chrome changes here instantly.',
      pushNotifications: 'Push notifications',
      subscribe: 'Subscribe',
      subscribed: 'Subscribed',
      subscribePush: 'Subscribe to push notifications',
      subscribedPush: 'Push notifications subscribed',
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
  hi: {
    translation: {
      appName: 'पंचांग', onboardingTitle: 'दैनिक डिफ़ॉल्ट चुनें', onboardingBody: 'अपना शहर, पंचांग परंपरा और भाषा चुनें। आप इन्हें बाद में सेटिंग्स में बदल सकते हैं।', useCurrentLocation: 'वर्तमान स्थान का उपयोग करें', continue: 'आगे बढ़ें', today: 'आज', home: 'मुख्य पृष्ठ', muhurta: 'मुहूर्त', festivals: 'पर्व', settings: 'सेटिंग्स', dateLabel: 'तारीख', selectDate: 'तारीख चुनें', language: 'Language', calendarSchool: 'पंचांग परंपरा', notificationTime: 'सूचना का समय', ayanamsa: 'अयनांश', howCalculated: 'इसकी गणना कैसे हुई', traditionMeta: 'परंपरा', timezone: 'समय क्षेत्र', location: 'स्थान', version: 'संस्करण', calculatedReference: 'केवल गणना किए गए समय का संदर्भ।', muhurtaHorizonEnd: 'समर्थित अवधि में और कोई मुहूर्त विंडो नहीं मिली।', retry: 'पुनः प्रयास करें', details: 'तकनीकी विवरण', coordinates: 'निर्देशांक', advertisement: 'विज्ञापन', advertisementEmpty: 'सहमति-आधारित अनुपालक प्रदाता के लिए आरक्षित।', festivalsForYear: 'पर्व कैलेंडर', save: 'सहेजें', geolocationDenied: 'स्थान की अनुमति नहीं मिली। दिल्ली का डिफ़ॉल्ट उपयोग हो रहा है।', city: 'शहर', changeLocation: 'स्थान बदलें', changeLocationTitle: 'नया स्थान खोजें', cancel: 'रद्द करें', schoolSelectorHint: 'नाम बैकएंड से आते हैं; UI के शब्द यहां तुरंत बदलते हैं।', pushNotifications: 'पुश सूचनाएं', subscribe: 'सदस्यता लें', subscribed: 'सदस्यता ली गई', tithi: 'तिथि', nakshatra: 'नक्षत्र', sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', rahuKaal: 'राहु काल', moonSign: 'चंद्र राशि', yoga: 'योग', karana: 'करण', loading: 'लोड हो रहा है…', noData: 'अभी ऑफ़लाइन कोई डेटा उपलब्ध नहीं है।',
    },
  },
  ta: {
    translation: {
      appName: 'பஞ்சாங்கம்', onboardingTitle: 'தினசரி இயல்புநிலைகளை அமைக்கவும்', onboardingBody: 'உங்கள் நகரம், நாள்காட்டி மரபு மற்றும் மொழியைத் தேர்ந்தெடுக்கவும். பின்னர் அமைப்புகளில் மாற்றலாம்.', useCurrentLocation: 'தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்', continue: 'தொடரவும்', today: 'இன்று', home: 'முகப்பு', muhurta: 'முஹூர்த்தம்', festivals: 'திருவிழாக்கள்', settings: 'அமைப்புகள்', dateLabel: 'தேதி', language: 'Language', calendarSchool: 'நாள்காட்டி மரபு', notificationTime: 'அறிவிப்பு நேரம்', ayanamsa: 'அயனாம்சம்', howCalculated: 'இது எவ்வாறு கணக்கிடப்பட்டது', traditionMeta: 'மரபு', timezone: 'நேர மண்டலம்', location: 'இருப்பிடம்', version: 'பதிப்பு', calculatedReference: 'கணக்கிடப்பட்ட நேரத்திற்கான குறிப்பு மட்டும்.', festivalsForYear: 'திருவிழா நாள்காட்டி', save: 'சேமிக்கவும்', geolocationDenied: 'இருப்பிட அனுமதி மறுக்கப்பட்டது. டெல்லி இயல்புநிலை பயன்படுத்தப்படுகிறது.', city: 'நகரம்', changeLocation: 'இருப்பிடத்தை மாற்றவும்', changeLocationTitle: 'புதிய இருப்பிடத்தைத் தேடவும்', cancel: 'ரத்து', schoolSelectorHint: 'பெயர்கள் பின்தளத்திலிருந்து வருகின்றன; UI சொற்கள் உடனடியாக மாறும்.', pushNotifications: 'புஷ் அறிவிப்புகள்', subscribe: 'சந்தா பெறவும்', subscribed: 'சந்தா பெறப்பட்டது', tithi: 'திதி', nakshatra: 'நட்சத்திரம்', sunrise: 'சூரிய உதயம்', sunset: 'சூரிய அஸ்தமனம்', rahuKaal: 'ராகு காலம்', moonSign: 'சந்திர ராசி', yoga: 'யோகம்', karana: 'கரணம்', loading: 'ஏற்றுகிறது…', noData: 'இதுவரை ஆஃப்லைனில் தரவு இல்லை.',
    },
  },
  te: {
    translation: {
      appName: 'పంచాంగం', onboardingTitle: 'రోజువారీ డిఫాల్ట్‌లను సెట్ చేయండి', onboardingBody: 'మీ నగరం, క్యాలెండర్ సంప్రదాయం మరియు భాషను ఎంచుకోండి. తర్వాత సెట్టింగ్స్‌లో మార్చవచ్చు.', useCurrentLocation: 'ప్రస్తుత స్థానాన్ని ఉపయోగించండి', continue: 'కొనసాగించండి', today: 'ఈ రోజు', home: 'ప్రధాన పేజీ', muhurta: 'ముహూర్తం', festivals: 'పండుగలు', settings: 'సెట్టింగ్స్', dateLabel: 'తేదీ', language: 'Language', calendarSchool: 'క్యాలెండర్ సంప్రదాయం', notificationTime: 'నోటిఫికేషన్ సమయం', ayanamsa: 'అయనాంశం', howCalculated: 'ఇది ఎలా లెక్కించబడింది', traditionMeta: 'సంప్రదాయం', timezone: 'సమయ మండలం', location: 'స్థానం', version: 'వెర్షన్', calculatedReference: 'లెక్కించిన సమయానికి మాత్రమే సూచన.', festivalsForYear: 'పండుగల క్యాలెండర్', save: 'భద్రపరచండి', geolocationDenied: 'స్థాన అనుమతి నిరాకరించబడింది. ఢిల్లీ డిఫాల్ట్ ఉపయోగించబడుతోంది.', city: 'నగరం', changeLocation: 'స్థానాన్ని మార్చండి', changeLocationTitle: 'కొత్త స్థానాన్ని శోధించండి', cancel: 'రద్దు', schoolSelectorHint: 'పేర్లు బ్యాక్‌ఎండ్ నుంచి వస్తాయి; UI పదాలు వెంటనే మారతాయి.', pushNotifications: 'పుష్ నోటిఫికేషన్లు', subscribe: 'సబ్‌స్క్రైబ్ చేయండి', subscribed: 'సబ్‌స్క్రైబ్ చేశారు', tithi: 'తిథి', nakshatra: 'నక్షత్రం', sunrise: 'సూర్యోదయం', sunset: 'సూర్యాస్తమయం', rahuKaal: 'రాహుకాలం', moonSign: 'చంద్ర రాశి', yoga: 'యోగం', karana: 'కరణం', loading: 'లోడ్ అవుతోంది…', noData: 'ఇంకా ఆఫ్‌లైన్ డేటా అందుబాటులో లేదు.',
    },
  },
  kn: {
    translation: {
      appName: 'ಪಂಚಾಂಗ', onboardingTitle: 'ದೈನಂದಿನ ಡೀಫಾಲ್ಟ್‌ಗಳನ್ನು ಹೊಂದಿಸಿ', onboardingBody: 'ನಿಮ್ಮ ನಗರ, ಪಂಚಾಂಗ ಪರಂಪರೆ ಮತ್ತು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನಂತರ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಬದಲಾಯಿಸಬಹುದು.', useCurrentLocation: 'ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಬಳಸಿ', continue: 'ಮುಂದುವರಿಸಿ', today: 'ಇಂದು', home: 'ಮುಖ್ಯ ಪುಟ', muhurta: 'ಮುಹೂರ್ತ', festivals: 'ಹಬ್ಬಗಳು', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', dateLabel: 'ದಿನಾಂಕ', language: 'Language', calendarSchool: 'ಪಂಚಾಂಗ ಪರಂಪರೆ', notificationTime: 'ಅಧಿಸೂಚನೆ ಸಮಯ', ayanamsa: 'ಅಯನಾಂಶ', howCalculated: 'ಇದನ್ನು ಹೇಗೆ ಲೆಕ್ಕ ಹಾಕಲಾಗಿದೆ', traditionMeta: 'ಪರಂಪರೆ', timezone: 'ಸಮಯ ವಲಯ', location: 'ಸ್ಥಳ', version: 'ಆವೃತ್ತಿ', calculatedReference: 'ಲೆಕ್ಕ ಹಾಕಿದ ಸಮಯದ ಉಲ್ಲೇಖ ಮಾತ್ರ.', festivalsForYear: 'ಹಬ್ಬಗಳ ಕ್ಯಾಲೆಂಡರ್', save: 'ಉಳಿಸಿ', geolocationDenied: 'ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದೆಹಲಿ ಡೀಫಾಲ್ಟ್ ಬಳಸಲಾಗುತ್ತಿದೆ.', city: 'ನಗರ', changeLocation: 'ಸ್ಥಳ ಬದಲಿಸಿ', changeLocationTitle: 'ಹೊಸ ಸ್ಥಳ ಹುಡುಕಿ', cancel: 'ರದ್ದು', schoolSelectorHint: 'ಹೆಸರುಗಳು ಬ್ಯಾಕೆಂಡ್‌ನಿಂದ ಬರುತ್ತವೆ; UI ಪದಗಳು ತಕ್ಷಣ ಬದಲಾಗುತ್ತವೆ.', pushNotifications: 'ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು', subscribe: 'ಚಂದಾದಾರರಾಗಿ', subscribed: 'ಚಂದಾದಾರರಾಗಿದ್ದೀರಿ', subscribePush: 'ಪುಶ್ ಅಧಿಸೂಚನೆಗಳಿಗೆ ಚಂದಾದಾರರಾಗಿ', subscribedPush: 'ಪುಶ್ ಅಧಿಸೂಚನೆಗಳಿಗೆ ಚಂದಾದಾರರಾಗಿದ್ದೀರಿ', tithi: 'ತಿಥಿ', nakshatra: 'ನಕ್ಷತ್ರ', sunrise: 'ಸೂರ್ಯೋದಯ', sunset: 'ಸೂರ್ಯಾಸ್ತ', rahuKaal: 'ರಾಹುಕಾಲ', moonSign: 'ಚಂದ್ರ ರಾಶಿ', yoga: 'ಯೋಗ', karana: 'ಕರಣ', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…', noData: 'ಇನ್ನೂ ಆಫ್‌ಲೈನ್ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.',
    },
  },
  ml: {
    translation: {
      appName: 'പഞ്ചാംഗം', onboardingTitle: 'ദൈനംദിന ഡിഫോൾട്ടുകൾ സജ്ജമാക്കുക', onboardingBody: 'നിങ്ങളുടെ നഗരം, കലണ്ടർ പാരമ്പര്യം, ഭാഷ എന്നിവ തിരഞ്ഞെടുക്കുക. പിന്നീട് ക്രമീകരണങ്ങളിൽ മാറ്റാം.', useCurrentLocation: 'നിലവിലെ സ്ഥലം ഉപയോഗിക്കുക', continue: 'തുടരുക', today: 'ഇന്ന്', home: 'പ്രധാന പേജ്', muhurta: 'മുഹൂർത്തം', festivals: 'ഉത്സവങ്ങൾ', settings: 'ക്രമീകരണങ്ങൾ', dateLabel: 'തീയതി', language: 'Language', calendarSchool: 'കലണ്ടർ പാരമ്പര്യം', notificationTime: 'അറിയിപ്പ് സമയം', ayanamsa: 'അയനാംശം', howCalculated: 'ഇത് എങ്ങനെ കണക്കാക്കി', traditionMeta: 'പാരമ്പര്യം', timezone: 'സമയ മേഖല', location: 'സ്ഥലം', version: 'പതിപ്പ്', calculatedReference: 'കണക്കാക്കിയ സമയത്തിന്റെ റഫറൻസ് മാത്രം.', festivalsForYear: 'ഉത്സവ കലണ്ടർ', save: 'സംരക്ഷിക്കുക', geolocationDenied: 'സ്ഥല അനുമതി നിരസിച്ചു. ഡൽഹി ഡിഫോൾട്ട് ഉപയോഗിക്കുന്നു.', city: 'നഗരം', changeLocation: 'സ്ഥലം മാറ്റുക', changeLocationTitle: 'പുതിയ സ്ഥലം തിരയുക', cancel: 'റദ്ദാക്കുക', schoolSelectorHint: 'പേരുകൾ ബാക്കെൻഡിൽ നിന്നാണ്; UI വാക്കുകൾ ഉടൻ മാറും.', pushNotifications: 'പുഷ് അറിയിപ്പുകൾ', subscribe: 'സബ്‌സ്‌ക്രൈബ് ചെയ്യുക', subscribed: 'സബ്‌സ്‌ക്രൈബ് ചെയ്തു', tithi: 'തിഥി', nakshatra: 'നക്ഷത്രം', sunrise: 'സൂര്യോദയം', sunset: 'സൂര്യാസ്തമയം', rahuKaal: 'രാഹുകാലം', moonSign: 'ചന്ദ്രരാശി', yoga: 'യോഗം', karana: 'കരണം', loading: 'ലോഡ് ചെയ്യുന്നു…', noData: 'ഇതുവരെ ഓഫ്‌ലൈൻ ഡാറ്റ ലഭ്യമല്ല.',
    },
  },
  mr: {
    translation: {
      appName: 'पंचांग', onboardingTitle: 'दैनंदिन डीफॉल्ट निवडा', onboardingBody: 'तुमचे शहर, पंचांग परंपरा आणि भाषा निवडा. नंतर सेटिंग्जमध्ये बदल करू शकता.', useCurrentLocation: 'सध्याचे स्थान वापरा', continue: 'पुढे जा', today: 'आज', home: 'मुख्यपृष्ठ', festivals: 'सण', settings: 'सेटिंग्ज',
      dateLabel: 'तारीख', selectDate: 'दिनांक निवडा', language: 'Language', calendarSchool: 'पंचांग परंपरा', notificationTime: 'सूचनेची वेळ', ayanamsa: 'अयनांश', howCalculated: 'याची गणना कशी झाली', traditionMeta: 'परंपरा', timezone: 'वेळ क्षेत्र', location: 'स्थान', version: 'आवृत्ती', calculatedReference: 'गणना केलेल्या वेळेचा फक्त संदर्भ.', muhurtaHorizonEnd: 'समर्थित कालावधीत आणखी कोणत्याही मुहूर्त विंडो सापडल्या नाहीत.', retry: 'पुन्हा प्रयत्न करा', details: 'तांत्रिक तपशील', coordinates: 'अक्षांश-रेखांश', advertisement: 'जाहिरात', advertisementEmpty: 'संमती-आधारित अनुपालक प्रदात्यासाठी राखीव.', festivalsForYear: 'सणांचे कॅलेंडर', save: 'जतन करा', geolocationDenied: 'स्थान परवानगी नाकारली. दिल्ली डीफॉल्ट वापरले जात आहे.', city: 'शहर', changeLocation: 'स्थान बदला', changeLocationTitle: 'नवीन स्थान शोधा', cancel: 'रद्द करा', schoolSelectorHint: 'नावे बॅकएंडमधून येतात; UI शब्द लगेच बदलतात.', pushNotifications: 'पुश सूचना', subscribe: 'सदस्यता घ्या', subscribed: 'सदस्यता घेतली', subscribePush: 'पुश सूचनांची सदस्यता घ्या', subscribedPush: 'पुश सूचनांची सदस्यता घेतली', tithi: 'तिथी', nakshatra: 'नक्षत्र', sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', rahuKaal: 'राहुकाळ', moonSign: 'चंद्रराशी', yoga: 'योग', karana: 'करण', loading: 'लोड होत आहे…', noData: 'अद्याप ऑफलाइन डेटा उपलब्ध नाही.',
    },
  },
  gu: {
    translation: {
      appName: 'પંચાંગ', onboardingTitle: 'દૈનિક ડિફૉલ્ટ સેટ કરો', onboardingBody: 'તમારું શહેર, પંચાંગ પરંપરા અને ભાષા પસંદ કરો. પછીથી સેટિંગ્સમાં બદલી શકો છો.', useCurrentLocation: 'વર્તમાન સ્થાનનો ઉપયોગ કરો', continue: 'ચાલુ રાખો', today: 'આજ', home: 'મુખ્ય પૃષ્ઠ', muhurta: 'મુહૂર્ત', festivals: 'ઉત્સવો', settings: 'સેટિંગ્સ', dateLabel: 'તારીખ', language: 'Language', calendarSchool: 'પંચાંગ પરંપરા', notificationTime: 'સૂચનાનો સમય', ayanamsa: 'અયનાંશ', howCalculated: 'આની ગણતરી કેવી રીતે થઈ', traditionMeta: 'પરંપરા', timezone: 'સમય ઝોન', location: 'સ્થાન', version: 'આવૃત્તિ', calculatedReference: 'ગણતરી કરેલા સમયનો માત્ર સંદર્ભ.', festivalsForYear: 'ઉત્સવ કૅલેન્ડર', save: 'સાચવો', geolocationDenied: 'સ્થાનની પરવાનગી નકારી કાઢવામાં આવી. દિલ્હી ડિફૉલ્ટ વપરાઈ રહ્યું છે.', city: 'શહેર', changeLocation: 'સ્થાન બદલો', changeLocationTitle: 'નવું સ્થાન શોધો', cancel: 'રદ કરો', schoolSelectorHint: 'નામો બૅકએન્ડમાંથી આવે છે; UI શબ્દો તરત બદલાય છે.', pushNotifications: 'પુશ સૂચનાઓ', subscribe: 'સબ્સ્ક્રાઇબ કરો', subscribed: 'સબ્સ્ક્રાઇબ કર્યું', tithi: 'તિથિ', nakshatra: 'નક્ષત્ર', sunrise: 'સૂર્યોદય', sunset: 'સૂર્યાસ્ત', rahuKaal: 'રાહુકાળ', moonSign: 'ચંદ્ર રાશિ', yoga: 'યોગ', karana: 'કરણ', loading: 'લોડ થઈ રહ્યું છે…', noData: 'હજુ સુધી ઑફલાઇન ડેટા ઉપલબ્ધ નથી.',
    },
  },
  bn: {
    translation: {
      appName: 'পঞ্চাঙ্গ', onboardingTitle: 'দৈনিক ডিফল্ট সেট করুন', onboardingBody: 'আপনার শহর, পঞ্জিকা পরম্পরা এবং ভাষা বেছে নিন। পরে সেটিংসে পরিবর্তন করতে পারবেন।', useCurrentLocation: 'বর্তমান অবস্থান ব্যবহার করুন', continue: 'চালিয়ে যান', today: 'আজ', home: 'মূল পৃষ্ঠা', muhurta: 'মুহূর্ত', festivals: 'উৎসব', settings: 'সেটিংস', dateLabel: 'তারিখ', language: 'Language', calendarSchool: 'পঞ্জিকা পরম্পরা', notificationTime: 'বিজ্ঞপ্তির সময়', ayanamsa: 'অয়নাংশ', howCalculated: 'এটি কীভাবে গণনা করা হয়েছে', traditionMeta: 'পরম্পরা', timezone: 'সময় অঞ্চল', location: 'অবস্থান', version: 'সংস্করণ', calculatedReference: 'গণনা করা সময়ের জন্য শুধু রেফারেন্স।', festivalsForYear: 'উৎসবের ক্যালেন্ডার', save: 'সংরক্ষণ করুন', geolocationDenied: 'অবস্থানের অনুমতি প্রত্যাখ্যাত হয়েছে। দিল্লির ডিফল্ট ব্যবহার করা হচ্ছে।', city: 'শহর', changeLocation: 'অবস্থান পরিবর্তন করুন', changeLocationTitle: 'নতুন অবস্থান খুঁজুন', cancel: 'বাতিল করুন', schoolSelectorHint: 'নামগুলি ব্যাকএন্ড থেকে আসে; UI শব্দগুলি সঙ্গে সঙ্গে বদলে যায়।', pushNotifications: 'পুশ বিজ্ঞপ্তি', subscribe: 'সাবস্ক্রাইব করুন', subscribed: 'সাবস্ক্রাইব করা হয়েছে', tithi: 'তিথি', nakshatra: 'নক্ষত্র', sunrise: 'সূর্যোদয়', sunset: 'সূর্যাস্ত', rahuKaal: 'রাহুকাল', moonSign: 'চন্দ্র রাশি', yoga: 'যোগ', karana: 'করণ', loading: 'লোড হচ্ছে…', noData: 'এখনও অফলাইন ডেটা পাওয়া যায়নি।',
    },
  },
  pa: {
    translation: {
      appName: 'ਪੰਚਾਂਗ', onboardingTitle: 'ਰੋਜ਼ਾਨਾ ਡਿਫ਼ਾਲਟ ਸੈੱਟ ਕਰੋ', onboardingBody: 'ਆਪਣਾ ਸ਼ਹਿਰ, ਪੰਚਾਂਗ ਪਰੰਪਰਾ ਅਤੇ ਭਾਸ਼ਾ ਚੁਣੋ। ਤੁਸੀਂ ਬਾਅਦ ਵਿੱਚ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਬਦਲ ਸਕਦੇ ਹੋ।', useCurrentLocation: 'ਮੌਜੂਦਾ ਟਿਕਾਣਾ ਵਰਤੋ', continue: 'ਜਾਰੀ ਰੱਖੋ', today: 'ਅੱਜ', home: 'ਮੁੱਖ ਪੰਨਾ', muhurta: 'ਮੁਹੂਰਤ', festivals: 'ਤਿਉਹਾਰ', settings: 'ਸੈਟਿੰਗਾਂ', dateLabel: 'ਤਾਰੀਖ', language: 'Language', calendarSchool: 'ਪੰਚਾਂਗ ਪਰੰਪਰਾ', notificationTime: 'ਸੂਚਨਾ ਦਾ ਸਮਾਂ', ayanamsa: 'ਅਯਨਾਂਸ਼', howCalculated: 'ਇਹ ਕਿਵੇਂ ਗਿਣਿਆ ਗਿਆ', traditionMeta: 'ਪਰੰਪਰਾ', timezone: 'ਸਮਾਂ ਖੇਤਰ', location: 'ਟਿਕਾਣਾ', version: 'ਵਰਜਨ', calculatedReference: 'ਗਿਣੇ ਹੋਏ ਸਮੇਂ ਲਈ ਸਿਰਫ਼ ਹਵਾਲਾ।', festivalsForYear: 'ਤਿਉਹਾਰ ਕੈਲੰਡਰ', save: 'ਸੰਭਾਲੋ', geolocationDenied: 'ਟਿਕਾਣੇ ਦੀ ਇਜਾਜ਼ਤ ਰੱਦ ਹੋ ਗਈ। ਦਿੱਲੀ ਡਿਫ਼ਾਲਟ ਵਰਤੀ ਜਾ ਰਹੀ ਹੈ।', city: 'ਸ਼ਹਿਰ', changeLocation: 'ਟਿਕਾਣਾ ਬਦਲੋ', changeLocationTitle: 'ਨਵਾਂ ਟਿਕਾਣਾ ਖੋਜੋ', cancel: 'ਰੱਦ ਕਰੋ', schoolSelectorHint: 'ਨਾਮ ਬੈਕਐਂਡ ਤੋਂ ਆਉਂਦੇ ਹਨ; UI ਦੇ ਸ਼ਬਦ ਤੁਰੰਤ ਬਦਲਦੇ ਹਨ।', pushNotifications: 'ਪੁਸ਼ ਸੂਚਨਾਵਾਂ', subscribe: 'ਸਬਸਕ੍ਰਾਈਬ ਕਰੋ', subscribed: 'ਸਬਸਕ੍ਰਾਈਬ ਕੀਤਾ', subscribePush: 'ਪੁਸ਼ ਸੂਚਨਾਵਾਂ ਲਈ ਸਬਸਕ੍ਰਾਈਬ ਕਰੋ', subscribedPush: 'ਪੁਸ਼ ਸੂਚਨਾਵਾਂ ਲਈ ਸਬਸਕ੍ਰਾਈਬ ਕੀਤਾ', tithi: 'ਤਿਥੀ', nakshatra: 'ਨਕਸ਼ਤਰ', sunrise: 'ਸੂਰਜ ਚੜ੍ਹਨਾ', sunset: 'ਸੂਰਜ ਡੁੱਬਣਾ', rahuKaal: 'ਰਾਹੂ ਕਾਲ', moonSign: 'ਚੰਦਰ ਰਾਸ਼ੀ', yoga: 'ਯੋਗ', karana: 'ਕਰਣ', loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…', noData: 'ਹਾਲੇ ਆਫ਼ਲਾਈਨ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
    },
  },
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

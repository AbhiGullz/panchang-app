import { useTranslation } from 'react-i18next'
import { chooseAdvertisingConsent as choose, useAdvertisingConsent } from '../lib/advertising-consent'
const COPY: Record<string, [string, string, string, string]> = {
  en: ['Optional advertising', 'Allow Adsterra to load ads? It may use cookies and process your IP address and browser information for advertising and measurement. You can change this choice in Settings.', 'Allow ads', 'No thanks'],
  hi: ['वैकल्पिक विज्ञापन', 'Adsterra के विज्ञापन दिखाने की अनुमति दें? यह विज्ञापन और मापन के लिए कुकीज़, आपका IP पता और ब्राउज़र जानकारी उपयोग कर सकता है। सेटिंग्स में यह विकल्प बदल सकते हैं।', 'विज्ञापन की अनुमति दें', 'नहीं, धन्यवाद'],
  mr: ['ऐच्छिक जाहिराती', 'Adsterra जाहिराती दाखवू द्यायच्या? जाहिराती व मोजणीसाठी कुकीज, तुमचा IP पत्ता व ब्राउझर माहिती वापरली जाऊ शकते. सेटिंगमध्ये निवड बदलू शकता.', 'जाहिरातींना परवानगी द्या', 'नको, धन्यवाद'],
  ta: ['விருப்ப விளம்பரங்கள்', 'Adsterra விளம்பரங்களை அனுமதிக்கவா? விளம்பரம் மற்றும் அளவீட்டிற்கு குக்கீகள், IP முகவரி மற்றும் உலாவித் தகவலைப் பயன்படுத்தலாம். அமைப்புகளில் இந்தத் தேர்வை மாற்றலாம்.', 'விளம்பரங்களை அனுமதி', 'வேண்டாம், நன்றி'],
  te: ['ఐచ్ఛిక ప్రకటనలు', 'Adsterra ప్రకటనలను అనుమతించాలా? ప్రకటనలు, కొలతల కోసం కుకీలు, IP చిరునామా, బ్రౌజర్ సమాచారాన్ని ఉపయోగించవచ్చు. సెట్టింగ్‌లలో ఎంపిక మార్చవచ్చు.', 'ప్రకటనలను అనుమతించు', 'వద్దు, ధన్యవాదాలు'],
  kn: ['ಐಚ್ಛಿಕ ಜಾಹೀರಾತುಗಳು', 'Adsterra ಜಾಹೀರಾತುಗಳನ್ನು ಅನುಮತಿಸಬೇಕೇ? ಜಾಹೀರಾತು ಮತ್ತು ಅಳತೆಗಾಗಿ ಕುಕೀಗಳು, IP ವಿಳಾಸ ಮತ್ತು ಬ್ರೌಸರ್ ಮಾಹಿತಿ ಬಳಸಬಹುದು. ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಆಯ್ಕೆ ಬದಲಿಸಬಹುದು.', 'ಜಾಹೀರಾತು ಅನುಮತಿಸಿ', 'ಬೇಡ, ಧನ್ಯವಾದಗಳು'],
  ml: ['ഐച്ഛിക പരസ്യങ്ങൾ', 'Adsterra പരസ്യങ്ങൾ അനുവദിക്കണോ? പരസ്യത്തിനും അളവെടുപ്പിനും കുക്കികൾ, IP വിലാസം, ബ്രൗസർ വിവരങ്ങൾ ഉപയോഗിക്കാം. ക്രമീകരണങ്ങളിൽ തിരഞ്ഞെടുപ്പ് മാറ്റാം.', 'പരസ്യങ്ങൾ അനുവദിക്കുക', 'വേണ്ട, നന്ദി'],
  gu: ['વૈકલ્પિક જાહેરાતો', 'Adsterra જાહેરાતો બતાવવા દો? જાહેરાત અને માપન માટે કુકીઝ, IP સરનામું અને બ્રાઉઝરની માહિતી વાપરી શકે છે. સેટિંગ્સમાં પસંદગી બદલી શકો છો.', 'જાહેરાતોને મંજૂરી આપો', 'ના, આભાર'],
  bn: ['ঐচ্ছিক বিজ্ঞাপন', 'Adsterra বিজ্ঞাপন দেখানোর অনুমতি দেবেন? বিজ্ঞাপন ও পরিমাপের জন্য কুকি, IP ঠিকানা ও ব্রাউজারের তথ্য ব্যবহার করতে পারে। সেটিংসে পছন্দ বদলাতে পারবেন।', 'বিজ্ঞাপনের অনুমতি দিন', 'না, ধন্যবাদ'],
  pa: ['ਵਿਕਲਪਿਕ ਇਸ਼ਤਿਹਾਰ', 'Adsterra ਦੇ ਇਸ਼ਤਿਹਾਰਾਂ ਦੀ ਆਗਿਆ ਦੇਣੀ ਹੈ? ਇਸ਼ਤਿਹਾਰ ਅਤੇ ਮਾਪ ਲਈ ਕੂਕੀਜ਼, IP ਪਤਾ ਤੇ ਬ੍ਰਾਊਜ਼ਰ ਜਾਣਕਾਰੀ ਵਰਤੀ ਜਾ ਸਕਦੀ ਹੈ। ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਚੋਣ ਬਦਲ ਸਕਦੇ ਹੋ।', 'ਇਸ਼ਤਿਹਾਰਾਂ ਦੀ ਆਗਿਆ ਦਿਓ', 'ਨਹੀਂ, ਧੰਨਵਾਦ'],
}
export function AdvertisingPreferences() {
  const { i18n, t } = useTranslation()
  const consent = useAdvertisingConsent()
  const copy = COPY[i18n.language.split('-')[0] ?? 'en'] ?? COPY.en!
  const buttonClass = (selected: boolean) => `cursor-pointer rounded-xl border px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-sky-700 ${selected ? 'border-sky-800 bg-sky-800 font-semibold text-white shadow-sm' : 'border-sky-300 bg-white text-sky-900 hover:bg-sky-100'}`
  return <section className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm">
    <h3 className="font-semibold">{copy[0]}</h3>
    <p className="mt-2 text-slate-600">{copy[1]} <a className="underline" href="/privacy.html">{t('privacy', { defaultValue: 'Privacy policy' })}</a></p>
    <div className="mt-3 flex flex-wrap gap-3">
      <button type="button" aria-pressed={consent === 'granted'} onClick={() => choose('granted')} className={buttonClass(consent === 'granted')}>{consent === 'granted' ? <span aria-hidden="true">✓ </span> : null}{copy[2]}</button>
      <button type="button" aria-pressed={consent === 'denied'} onClick={() => choose('denied')} className={buttonClass(consent === 'denied')}>{consent === 'denied' ? <span aria-hidden="true">✓ </span> : null}{copy[3]}</button>
    </div>
  </section>
}

import { Component, type ReactNode } from 'react'
import i18n from '../locales/i18n'
import { useAppStore } from '../store/app-store'

const MESSAGES: Record<string, string> = {
  en: 'The app could not display this page. Your saved tithis have not been deleted. Try reloading or return to Home.',
  hi: 'यह पृष्ठ नहीं खुल सका। आपकी सहेजी तिथियाँ नहीं मिटाई गई हैं। पुनः लोड करें या मुख्य पृष्ठ पर जाएँ।',
  mr: 'हे पान उघडले नाही. जतन केलेल्या तिथी हटवलेल्या नाहीत. पुन्हा लोड करा किंवा मुख्यपृष्ठावर जा.',
  ta: 'இந்தப் பக்கத்தைக் காட்ட முடியவில்லை. சேமித்த திதிகள் நீக்கப்படவில்லை. மீண்டும் ஏற்றவும் அல்லது முகப்புக்குச் செல்லவும்.',
  te: 'ఈ పేజీ కనిపించడం లేదు. మీ భద్రపరిచిన తిథులు తొలగించబడలేదు. మళ్లీ లోడ్ చేయండి లేదా ముఖపుటకు వెళ్లండి.',
  kn: 'ಈ ಪುಟವನ್ನು ತೋರಿಸಲಾಗಲಿಲ್ಲ. ಉಳಿಸಿದ ತಿಥಿಗಳನ್ನು ಅಳಿಸಿಲ್ಲ. ಮರುಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಹೋಗಿ.',
  ml: 'ഈ പേജ് കാണിക്കാനായില്ല. സൂക്ഷിച്ച തിഥികൾ മായ്ച്ചിട്ടില്ല. വീണ്ടും ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ മുഖപ്പേജിലേക്ക് പോകുക.',
  gu: 'આ પાનું બતાવી શકાયું નથી. સાચવેલી તિથિઓ કાઢી નથી. ફરી લોડ કરો અથવા મુખ્ય પૃષ્ઠ પર જાઓ.',
  bn: 'এই পৃষ্ঠাটি দেখানো যায়নি। সংরক্ষিত তিথিগুলি মোছা হয়নি। আবার লোড করুন বা মূল পাতায় যান।',
  pa: 'ਇਹ ਪੰਨਾ ਦਿਖਾਇਆ ਨਹੀਂ ਜਾ ਸਕਿਆ। ਸੰਭਾਲੀਆਂ ਤਿਥੀਆਂ ਮਿਟਾਈਆਂ ਨਹੀਂ ਗਈਆਂ। ਦੁਬਾਰਾ ਲੋਡ ਕਰੋ ਜਾਂ ਮੁੱਖ ਪੰਨੇ ਉੱਤੇ ਜਾਓ।',
}

export class AppRecovery extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error) { console.error('Gajaa Panchang render failure:', error) }
  render() {
    if (!this.state.failed) return this.props.children
    const lang = i18n.language.split('-')[0] ?? 'en'
    return <main role="alert" className="mx-auto mt-8 max-w-xl space-y-4 rounded-3xl bg-white p-6 text-slate-900 shadow-sm">
      <h1 className="text-xl font-semibold">{i18n.t('appName')}</h1>
      <p>{MESSAGES[lang] ?? MESSAGES.en}</p>
      <div className="flex gap-3">
        <button type="button" className="cursor-pointer rounded-xl bg-sky-800 px-4 py-2 text-white" onClick={() => window.location.reload()}>{i18n.t('retry')}</button>
        <button type="button" className="cursor-pointer rounded-xl border border-sky-300 px-4 py-2" onClick={() => { useAppStore.getState().setActiveTab('today'); this.setState({ failed: false }) }}>{i18n.t('home')}</button>
      </div>
    </main>
  }
}

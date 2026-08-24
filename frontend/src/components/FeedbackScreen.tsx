import { useTranslation } from 'react-i18next'

interface Props { onBack: () => void }

export function FeedbackScreen({ onBack }: Props) {
  const { t } = useTranslation()
  return <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100">
    <button className="text-sm font-semibold text-sky-700" onClick={onBack} type="button">← {t('back')}</button>
    <h2 className="text-lg font-semibold text-slate-900">{t('feedback')}</h2>
    <p className="text-sm text-slate-600">{t('feedbackBody')}</p>
    <label className="block text-sm font-medium text-slate-700">{t('feedbackMessage')}
      <textarea className="mt-1 min-h-36 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3" placeholder={t('feedbackPlaceholder')} />
    </label>
    <a className="inline-block rounded-2xl bg-[#163B63] px-4 py-3 text-sm font-semibold text-white" href="mailto:feedback@gaja-panchang.app?subject=Gajaa%20Panchang%20feedback">{t('sendFeedback')}</a>
  </section>
}

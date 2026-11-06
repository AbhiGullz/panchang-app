import { useTranslation } from 'react-i18next'
import { guideLabel } from '../lib/new-feature-copy'
export function GuideTab() {
  const { i18n } = useTranslation()
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#D7E7F0]">
      <iframe key={i18n.language} title={guideLabel(i18n.language)} src={`/guide.html?lang=${i18n.language}`} className="h-[min(78vh,900px)] w-full border-0" />
    </section>
  )
}

import { CalendarDays, Home, Settings, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  activeTab: 'today' | 'muhurta' | 'festivals' | 'settings'
  onTabChange: (tab: Props['activeTab']) => void
}

export function BottomNav({ activeTab, onTabChange }: Props) {
  const { t } = useTranslation()
  const tabs = [
    { key: 'today', label: t('home'), icon: Home },
    { key: 'muhurta', label: t('muhurta'), icon: Sparkles },
    { key: 'festivals', label: t('festivals'), icon: CalendarDays },
    { key: 'settings', label: t('settings'), icon: Settings },
  ] as const

  return (
    <nav className="relative z-10 mx-auto flex w-full max-w-xl rounded-3xl bg-white/95 p-2 shadow-lg ring-1 ring-[#D7E7F0] backdrop-blur">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const selected = activeTab === tab.key
        return (
          <button
            key={tab.key}
            className={`flex min-h-11 flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium ${selected ? 'bg-[#DDF3FC] text-[#0F2747]' : 'text-[#64748B]'}`}
            onClick={() => onTabChange(tab.key)}
            type="button"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

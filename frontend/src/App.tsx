import { useEffect, useMemo, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { loadPersonalTithis, personalEvents } from './lib/personal-tithis'
import { useTranslation } from 'react-i18next'
import { DatePicker } from './components/DatePicker'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './locales/i18n'
import { BottomNav } from './components/BottomNav'
import { AdvertisementSlot } from './components/AdvertisementSlot'
import { FestivalsTab } from './components/FestivalsTab'
import { FeedbackScreen } from './components/FeedbackScreen'
import { GuideTab } from './components/GuideTab'
import { PanchangLogo } from './components/PanchangLogo'
import { MuhurtaTab } from './components/MuhurtaTab'
import { OnboardingCard } from './components/OnboardingCard'
import { SettingsTab } from './components/SettingsTab'
import { SankalpaTab } from './components/SankalpaTab'
import { TodayView } from './components/TodayView'
import { useFestivals } from './hooks/use-festivals'
import { usePanchang } from './hooks/use-panchang'
import { reverseGeocode } from './lib/location'
import { formatDateInput } from './lib/utils'
import { useAppStore } from './store/app-store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppShell() {
  const { t, i18n } = useTranslation()
  const {
    preferences,
    activeTab,
    selectedDate,
    setActiveTab,
    setSelectedDate,
    updateLocation,
    updateLanguage,
    updateCalendar,
    updateNotificationTime,
    updateAyanamsa,
    completeOnboarding,
  } = useAppStore()
  const [notice, setNotice] = useState('')
  const [personalItems, setPersonalItems] = useState(loadPersonalTithis)
  useEffect(() => {
    const refresh = () => setPersonalItems(loadPersonalTithis())
    window.addEventListener('gajaa:personal-tithis', refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener('gajaa:personal-tithis', refresh); window.removeEventListener('storage', refresh) }
  }, [])
  const [sankalpaDirty, setSankalpaDirty] = useState(false)
  const locationRefreshId = useRef(0)

  useRegisterSW()

  useEffect(() => {
    const handleDirty = (event: Event) => setSankalpaDirty(Boolean((event as CustomEvent<boolean>).detail))
    window.addEventListener('gajaa:sankalpa-dirty', handleDirty)
    return () => window.removeEventListener('gajaa:sankalpa-dirty', handleDirty)
  }, [])

  const changeTab = (nextTab: typeof activeTab) => {
    if (activeTab === 'sankalpa' && nextTab !== 'sankalpa' && sankalpaDirty && !window.confirm('Sankalpa fields contain personal information. Leaving this page will clear them. Continue?')) return
    setActiveTab(nextTab)
  }

  useEffect(() => {
    void i18n.changeLanguage(preferences.language)
  }, [i18n, preferences.language])

  useEffect(() => {
    // Saved locations created before a language change retain their old label.
    // Refresh that label once per coordinate/language pair, without touching
    // the selected date or Panchang calculation.
    const labelKey = `gajaa-location-label:${preferences.location.lat.toFixed(4)}:${preferences.location.lng.toFixed(4)}`
    const requestId = ++locationRefreshId.current
    void reverseGeocode(preferences.location.lat, preferences.location.lng, preferences.language)
      .then((location) => {
        if (requestId !== locationRefreshId.current) return
        updateLocation(location)
        localStorage.setItem(labelKey, `v5:${preferences.language}`)
      })
      .catch(() => undefined)
    return () => { locationRefreshId.current += 1 }
  }, [preferences.language, preferences.location.lat, preferences.location.lng, updateLocation])

  const { data: panchangData } = usePanchang(
    selectedDate,
    preferences.location.lat,
    preferences.location.lng,
    preferences.location.tz,
    preferences.calendar,
    preferences.language,
  )

  const festivalYear = useMemo(() => Number(selectedDate.slice(0, 4)), [selectedDate])
  const { data: festivalsData, isError: festivalsError } = useFestivals(festivalYear, preferences.calendar, preferences.language, preferences.location.lat, preferences.location.lng, preferences.location.tz)
  const tomorrowDate = new Date(`${selectedDate}T12:00:00Z`)
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1)
  const tomorrow = tomorrowDate.toISOString().slice(0, 10)
  const { data: nextYearFestivals } = useFestivals(Number(tomorrow.slice(0, 4)), preferences.calendar, preferences.language, preferences.location.lat, preferences.location.lng, preferences.location.tz)
  const { data: personalDates = [] } = useQuery({
    queryKey: ['personal-dates', personalItems, festivalYear, tomorrow.slice(0, 4), preferences.language],
    queryFn: async () => (await Promise.all([...new Set([festivalYear, Number(tomorrow.slice(0, 4))])].map(year => personalEvents(personalItems, year, preferences.language)))).flat(),
    staleTime: Infinity,
  })
  const annualEvents = festivalsData ? { ...festivalsData, festivals: [...festivalsData.festivals, ...personalDates.filter(item => item.date.startsWith(String(festivalYear)))].sort((a, b) => a.date.localeCompare(b.date)) } : undefined
  const observances = [...(festivalsData?.festivals ?? []), ...personalDates].filter(item => item.date === selectedDate)
  const tomorrowObservances = [...(nextYearFestivals?.festivals ?? []), ...personalDates].filter(item => item.date === tomorrow)
  const nextObservance = [...(festivalsData?.festivals ?? []), ...(nextYearFestivals?.festivals ?? []), ...personalDates]
    .filter(item => item.date > selectedDate).sort((a, b) => a.date.localeCompare(b.date))[0]
  const hasPublisherContent = activeTab === 'festivals'
    ? Boolean(festivalsData?.festivals.length)
    : (activeTab === 'today' || activeTab === 'muhurta') && Boolean(panchangData)
  const canShowAds = preferences.onboardingComplete && hasPublisherContent

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setNotice(t('geolocationDenied'))
      return
    }

    try {
      const location = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 8000 }),
      )
      const next = await reverseGeocode(location.coords.latitude, location.coords.longitude, preferences.language)
      updateLocation(next)
      setNotice('')
    } catch {
      setNotice(t('geolocationDenied'))
    }
  }

  const changeLanguage = (language: typeof preferences.language) => {
    updateLanguage(language)
    void i18n.changeLanguage(language)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col gap-4 px-4 py-5 text-[#12233A] sm:px-6 lg:px-8">
      <header aria-label={t('appName')} className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7E7F0]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="cursor-pointer rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400" onClick={() => setActiveTab('guide')} aria-label="Open Panchang guide"><PanchangLogo className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" /></button>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#163B63]">{t('appName')}</div>
              <h1 className="text-xl font-semibold leading-tight sm:text-2xl">{preferences.location.city}</h1>
            </div>
          </div>
          <div className="w-full shrink-0 sm:w-auto"><DatePicker value={selectedDate} onChange={date => setSelectedDate(date || formatDateInput(new Date()))} language={i18n.language} label={t('selectDate')} /></div>
        </div>

      </header>

      <div className="xl:grid xl:grid-cols-[240px_minmax(0,768px)_240px] xl:items-start xl:justify-center xl:gap-5">
        <div className="hidden min-w-0 xl:col-start-1 xl:row-start-1 xl:block">
          {canShowAds ? <AdvertisementSlot className="sticky top-5 min-h-[520px]" format="vertical" /> : null}
        </div>
        <main className="min-w-0 space-y-4 xl:col-start-2 xl:row-start-1">
      {!preferences.onboardingComplete ? (
        <OnboardingCard
          location={preferences.location}
          language={preferences.language}
          calendar={preferences.calendar}
          onLocationChange={updateLocation}
          onLanguageChange={changeLanguage}
          onCalendarChange={updateCalendar}
          onUseCurrentLocation={useCurrentLocation}
          onContinue={completeOnboarding}
        />
      ) : null}

      {notice ? <div className="rounded-2xl bg-[#DDF3FC] px-4 py-3 text-sm text-[#163B63]">{notice}</div> : null}

      {activeTab === 'today' ? <TodayView data={panchangData} onGuide={() => changeTab('guide')} observances={observances} tomorrowObservances={tomorrowObservances} nextObservance={nextObservance} /> : null}
      {activeTab === 'muhurta' ? <MuhurtaTab data={panchangData} /> : null}
      {activeTab === 'sankalpa' ? <SankalpaTab data={panchangData} locationName={preferences.location.city} selectedDate={selectedDate} /> : null}
      {activeTab === 'festivals' ? <FestivalsTab data={annualEvents} error={festivalsError} /> : null}
      {activeTab === 'settings' ? (
        <SettingsTab
          preferences={preferences}
          onLanguageChange={changeLanguage}
          onCalendarChange={updateCalendar}
          onNotificationTimeChange={updateNotificationTime}
          onAyanamsaChange={updateAyanamsa}
          onLocationChange={updateLocation}
          onFeedback={() => setActiveTab('feedback')}
        />
      ) : null}
      {activeTab === 'guide' ? <GuideTab /> : null}
      {activeTab === 'feedback' ? <FeedbackScreen onBack={() => setActiveTab('settings')} /> : null}

          {canShowAds ? <AdvertisementSlot className="xl:hidden" /> : null}

        </main>
        <div className="hidden min-w-0 xl:col-start-3 xl:row-start-1 xl:block">
          {canShowAds ? <AdvertisementSlot className="sticky top-5 min-h-[520px]" format="vertical" /> : null}
        </div>
      </div>
      <footer className="mx-auto w-full max-w-3xl pb-24" aria-hidden="true" />
      <BottomNav activeTab={activeTab} onTabChange={changeTab} />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  )
}

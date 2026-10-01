import { useEffect, useMemo, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './locales/i18n'
import { BottomNav } from './components/BottomNav'
import { AdvertisementSlot } from './components/AdvertisementSlot'
import { FestivalsTab } from './components/FestivalsTab'
import { FeedbackScreen } from './components/FeedbackScreen'
import { PanchangLogo } from './components/PanchangLogo'
import { MuhurtaTab } from './components/MuhurtaTab'
import { OnboardingCard } from './components/OnboardingCard'
import { SettingsTab } from './components/SettingsTab'
import { TodayView } from './components/TodayView'
import { useFestivals } from './hooks/use-festivals'
import { usePanchang } from './hooks/use-panchang'
import { reverseGeocode } from './lib/location'
import { formatCompactDate } from './lib/utils'
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
  const locationRefreshId = useRef(0)

  useRegisterSW()

  useEffect(() => {
    void i18n.changeLanguage(preferences.language)
  }, [i18n, preferences.language])

  useEffect(() => {
    // Saved locations created before a language change retain their old label.
    // Refresh that label once per coordinate/language pair, without touching
    // the selected date or Panchang calculation.
    const labelKey = `gajaa-location-label:${preferences.location.lat.toFixed(4)}:${preferences.location.lng.toFixed(4)}`
    if (localStorage.getItem(labelKey) === `v4:${preferences.language}`) return
    const requestId = ++locationRefreshId.current
    void reverseGeocode(preferences.location.lat, preferences.location.lng, preferences.language)
      .then((location) => {
        if (requestId !== locationRefreshId.current) return
        updateLocation(location)
        localStorage.setItem(labelKey, `v4:${preferences.language}`)
      })
      .catch(() => undefined)
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
  const { data: festivalsData } = useFestivals(festivalYear, preferences.calendar, preferences.language)
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <PanchangLogo className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#163B63]">{t('appName')}</div>
              <h1 className="text-2xl font-semibold">{preferences.location.city}</h1>
            </div>
          </div>
          <label className="relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-[#D7E7F0] bg-[#F5FAFD] px-3 py-2 text-sm text-[#12233A]">
            <span aria-hidden="true">{formatCompactDate(selectedDate, i18n.language)}</span>
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            <input
              aria-label={t('selectDate')}
              className="absolute inset-0 cursor-pointer opacity-0"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
        </div>

      </header>

      <div className="xl:grid xl:grid-cols-[240px_minmax(0,768px)_240px] xl:justify-center xl:items-stretch xl:gap-5">
        {canShowAds ? <AdvertisementSlot className="sticky top-5 hidden h-full min-h-[520px] xl:block" format="vertical" /> : <div className="hidden xl:block" />}
        <main className="min-w-0 space-y-4">
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

      {activeTab === 'today' ? <TodayView data={panchangData} /> : null}
      {activeTab === 'muhurta' ? <MuhurtaTab data={panchangData} /> : null}
      {activeTab === 'festivals' ? <FestivalsTab data={festivalsData} /> : null}
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
      {activeTab === 'feedback' ? <FeedbackScreen onBack={() => setActiveTab('settings')} /> : null}

      {canShowAds ? <AdvertisementSlot className="xl:hidden" /> : null}

        </main>
        {canShowAds ? <AdvertisementSlot className="sticky top-5 hidden h-full min-h-[520px] xl:block" format="vertical" /> : <div className="hidden xl:block" />}
      </div>
      <footer className="mx-auto flex w-full max-w-3xl justify-center gap-5 pb-24 text-xs text-slate-500">
        <a className="underline" href="/guide.html">Panchang guide</a>
        <a className="underline" href="/privacy.html">Privacy</a>
      </footer>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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

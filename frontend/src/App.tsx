import { useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
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
import { humanizeCalendar } from './lib/utils'
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

  useRegisterSW()

  useEffect(() => {
    void i18n.changeLanguage(preferences.language)
  }, [i18n, preferences.language])

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
    void reverseGeocode(preferences.location.lat, preferences.location.lng, language)
      .then(updateLocation)
      .catch(() => undefined)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-4 px-4 py-5 text-[#12233A]">
      <header aria-label={t('appName')} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7E7F0]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <PanchangLogo className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#163B63]">{t('appName')}</div>
              <h1 className="text-2xl font-semibold">{preferences.location.city}</h1>
            </div>
          </div>
          <input
            aria-label={t('selectDate')}
            className="rounded-2xl border border-[#D7E7F0] bg-[#F5FAFD] px-3 py-2 text-sm text-[#12233A]"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>

      </header>

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

      <AdvertisementSlot />

      {activeTab === 'today' ? <TodayView data={panchangData} city={preferences.location.city} calendar={humanizeCalendar(preferences.calendar, preferences.language)} ayanamsa={preferences.ayanamsa} /> : null}
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

      <AdvertisementSlot />
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

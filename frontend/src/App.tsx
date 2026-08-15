import { useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './locales/i18n'
import { BottomNav } from './components/BottomNav'
import { AdvertisementSlot } from './components/AdvertisementSlot'
import { FestivalsTab } from './components/FestivalsTab'
import { MoonPhaseLogo } from './components/MoonPhaseLogo'
import { MuhurtaTab } from './components/MuhurtaTab'
import { OnboardingCard } from './components/OnboardingCard'
import { SettingsTab } from './components/SettingsTab'
import { TodayView } from './components/TodayView'
import { useFestivals } from './hooks/use-festivals'
import { useMuhurta } from './hooks/use-muhurta'
import { usePanchang } from './hooks/use-panchang'
import { reverseGeocode } from './lib/location'
import { subscribeForPush } from './lib/push'
import { loadPushSubscription, savePushSubscription } from './lib/storage'
import { humanizeCalendar, humanizeLanguage } from './lib/utils'
import { useAppStore } from './store/app-store'
import type { MuhurtaCategory } from './types/api'

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
  const [category, setCategory] = useState<MuhurtaCategory>('travel')
  const [pushReady, setPushReady] = useState(Boolean(loadPushSubscription()))
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

  const { data: muhurtaData } = useMuhurta(
    selectedDate,
    preferences.location.lat,
    preferences.location.lng,
    preferences.location.tz,
    preferences.calendar,
    category,
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
      const next = await reverseGeocode(location.coords.latitude, location.coords.longitude)
      updateLocation(next)
      setNotice('')
    } catch {
      setNotice(t('geolocationDenied'))
    }
  }

  const subscribePush = async () => {
    try {
      const key = import.meta.env.VITE_VAPID_PUBLIC_KEY
      if (!key) {
        setNotice('Set VITE_VAPID_PUBLIC_KEY in .env for real push subscriptions.')
        return
      }
      const subscription = await subscribeForPush(key)
      savePushSubscription(subscription)
      setPushReady(true)
      setNotice('Push subscription saved locally. Backend VAPID registration endpoint still needed.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Push subscription failed.')
    }
  }

  const changeLanguage = (language: typeof preferences.language) => {
    updateLanguage(language)
    void i18n.changeLanguage(language)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-4 px-4 py-5 text-slate-900">
      <header className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <MoonPhaseLogo elongationDegrees={panchangData?.phase?.elongation_degrees} label={panchangData?.tithi.name[i18n.language as keyof typeof panchangData.tithi.name] ?? t('tithi')} />
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-orange-500">{t('appName')}</div>
              <h1 className="text-2xl font-semibold">{preferences.location.city}</h1>
              <p className="text-sm text-slate-500">{humanizeLanguage(preferences.language)}</p>
            </div>
          </div>
          <input
            aria-label={t('selectDate')}
            className="rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm"
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

      {notice ? <div className="rounded-2xl bg-orange-100 px-4 py-3 text-sm text-orange-800">{notice}</div> : null}

      <AdvertisementSlot />

      {activeTab === 'today' ? <TodayView data={panchangData} calendar={humanizeCalendar(preferences.calendar, preferences.language)} ayanamsa={preferences.ayanamsa} /> : null}
      {activeTab === 'muhurta' ? <MuhurtaTab category={category} onCategoryChange={setCategory} data={muhurtaData} /> : null}
      {activeTab === 'festivals' ? <FestivalsTab data={festivalsData} /> : null}
      {activeTab === 'settings' ? (
        <SettingsTab
          preferences={preferences}
          onLanguageChange={changeLanguage}
          onCalendarChange={updateCalendar}
          onNotificationTimeChange={updateNotificationTime}
          onAyanamsaChange={updateAyanamsa}
          onLocationChange={updateLocation}
          onSubscribePush={subscribePush}
          pushReady={pushReady}
        />
      ) : null}

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

import { create } from 'zustand'
import { DEFAULT_PREFERENCES } from '../lib/constants'
import { loadPreferences, savePreferences } from '../lib/storage'
import { formatDateInput } from '../lib/utils'
import i18n from '../locales/i18n'
import type { AppPreferences, CalendarSchool, LanguageCode, LocationPreference } from '../types/api'

interface AppState {
  preferences: AppPreferences
  activeTab: 'today' | 'muhurta' | 'festivals' | 'settings' | 'feedback'
  selectedDate: string
  setActiveTab: (tab: AppState['activeTab']) => void
  setSelectedDate: (date: string) => void
  updateLocation: (location: LocationPreference) => void
  updateLanguage: (language: LanguageCode) => void
  updateCalendar: (calendar: CalendarSchool) => void
  updateNotificationTime: (notificationTime: string) => void
  updateAyanamsa: (ayanamsa: string) => void
  completeOnboarding: () => void
}

const initialPreferences = typeof window === 'undefined' ? DEFAULT_PREFERENCES : loadPreferences()
const initialDate = typeof window === 'undefined' ? formatDateInput(new Date()) : window.localStorage.getItem('gajaa-selected-date') ?? formatDateInput(new Date())
const storedTab = typeof window === 'undefined' ? null : window.localStorage.getItem('gajaa-active-tab')
const initialTab: AppState['activeTab'] = storedTab === 'muhurta' || storedTab === 'festivals' || storedTab === 'settings' || storedTab === 'feedback' ? storedTab : 'today'

const persist = (preferences: AppPreferences) => {
  savePreferences(preferences)
  return preferences
}

export const useAppStore = create<AppState>((set) => ({
  preferences: initialPreferences,
  activeTab: initialTab,
  selectedDate: initialDate,
  setActiveTab: (activeTab) => { if (typeof window !== 'undefined') window.localStorage.setItem('gajaa-active-tab', activeTab); set({ activeTab }) },
  setSelectedDate: (selectedDate) => { if (typeof window !== 'undefined') window.localStorage.setItem('gajaa-selected-date', selectedDate); set({ selectedDate }) },
  updateLocation: (location) =>
    set((state) => ({
      preferences: persist({ ...state.preferences, location }),
    })),
  updateLanguage: (language) => {
    void i18n.changeLanguage(language)
    set((state) => ({
      preferences: persist({ ...state.preferences, language }),
    }))
  },
  updateCalendar: (calendar) =>
    set((state) => ({
      preferences: persist({ ...state.preferences, calendar }),
    })),
  updateNotificationTime: (notificationTime) =>
    set((state) => ({
      preferences: persist({ ...state.preferences, notificationTime }),
    })),
  updateAyanamsa: (ayanamsa) =>
    set((state) => ({
      preferences: persist({ ...state.preferences, ayanamsa }),
    })),
  completeOnboarding: () =>
    set((state) => ({
      preferences: persist({ ...state.preferences, onboardingComplete: true }),
    })),
}))

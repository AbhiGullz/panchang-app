import { create } from 'zustand'
import { DEFAULT_PREFERENCES } from '../lib/constants'
import { loadPreferences, savePreferences } from '../lib/storage'
import type { AppPreferences, CalendarSchool, LanguageCode, LocationPreference } from '../types/api'

interface AppState {
  preferences: AppPreferences
  activeTab: 'today' | 'muhurta' | 'festivals' | 'settings'
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

const persist = (preferences: AppPreferences) => {
  savePreferences(preferences)
  return preferences
}

export const useAppStore = create<AppState>((set) => ({
  preferences: initialPreferences,
  activeTab: 'today',
  selectedDate: new Date().toISOString().slice(0, 10),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  updateLocation: (location) =>
    set((state) => ({
      preferences: persist({ ...state.preferences, location }),
    })),
  updateLanguage: (language) =>
    set((state) => ({
      preferences: persist({ ...state.preferences, language }),
    })),
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

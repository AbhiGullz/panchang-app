import { create } from 'zustand'
import { DEFAULT_PREFERENCES } from '../lib/constants'
import { loadPreferences, savePreferences, readStoredValue, writeStoredValue, validStoredDate } from '../lib/storage'
import { formatDateInput } from '../lib/utils'
import i18n from '../locales/i18n'
import type { AppPreferences, CalendarSchool, LanguageCode, LocationPreference } from '../types/api'

interface AppState {
  preferences: AppPreferences
  activeTab: 'today' | 'muhurta' | 'sankalpa' | 'festivals' | 'settings' | 'guide' | 'feedback'
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
const storedDate = readStoredValue('gajaa-selected-date')
const initialDate = validStoredDate(storedDate) ? storedDate! : formatDateInput(new Date())
const storedTab = readStoredValue('gajaa-active-tab')
const initialTab: AppState['activeTab'] = storedTab === 'muhurta' || storedTab === 'sankalpa' || storedTab === 'festivals' || storedTab === 'settings' || storedTab === 'guide' || storedTab === 'feedback' ? storedTab : 'today'

const persist = (preferences: AppPreferences) => {
  savePreferences(preferences)
  return preferences
}

export const useAppStore = create<AppState>((set) => ({
  preferences: initialPreferences,
  activeTab: initialTab,
  selectedDate: initialDate,
  setActiveTab: (activeTab) => { writeStoredValue('gajaa-active-tab', activeTab); set({ activeTab }) },
  setSelectedDate: (selectedDate) => { const date = validStoredDate(selectedDate) ? selectedDate : formatDateInput(new Date()); writeStoredValue('gajaa-selected-date', date); set({ selectedDate: date }) },
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

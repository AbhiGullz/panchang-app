import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_CALENDARS, SUPPORTED_LANGUAGES } from '../types/api'
import { humanizeCalendar } from '../lib/utils'
import { LocationPicker } from './LocationPicker'
import type { AppPreferences, CalendarSchool, LanguageCode } from '../types/api'

interface Props {
  preferences: AppPreferences
  onLanguageChange: (language: LanguageCode) => void
  onCalendarChange: (calendar: CalendarSchool) => void
  onNotificationTimeChange: (time: string) => void
  onAyanamsaChange: (value: string) => void
  onLocationChange: (location: AppPreferences['location']) => void
  onSubscribePush: () => Promise<void>
  pushReady: boolean
}

export function SettingsTab(props: Props) {
  const { t } = useTranslation()
  const [editingLocation, setEditingLocation] = useState(false)

  return (
    <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100">
      <h2 className="text-lg font-semibold text-slate-900">{t('settings')}</h2>
      <div className="rounded-2xl bg-orange-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-sm font-medium text-slate-700">{t('location')}</p><p className="font-semibold text-slate-900">{props.preferences.location.city}</p><p className="text-xs text-slate-500">{props.preferences.location.lat}, {props.preferences.location.lng} · {props.preferences.location.tz}</p></div>
          {!editingLocation && <button className="rounded-xl border border-orange-300 px-3 py-2 text-sm font-semibold text-orange-700" onClick={() => setEditingLocation(true)} type="button">{t('changeLocation')}</button>}
        </div>
        {editingLocation && <div className="mt-3"><p className="mb-2 text-sm font-medium text-slate-700">{t('changeLocationTitle')}</p><LocationPicker location={props.preferences.location} onLocationChange={(location) => { props.onLocationChange(location); setEditingLocation(false) }} onCancel={() => setEditingLocation(false)} showCancel /></div>}
      </div>
      <label className="block text-sm font-medium text-slate-700">
        {t('language')}
        <select
          aria-label={t('language')}
          className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
          value={props.preferences.language}
          onChange={(event) => props.onLanguageChange(event.target.value as LanguageCode)}
        >
          {SUPPORTED_LANGUAGES.map((option) => <option key={option} value={option}>{option.toUpperCase()}</option>)}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        {t('calendarSchool')}
        <select
          className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
          value={props.preferences.calendar}
          onChange={(event) => props.onCalendarChange(event.target.value as CalendarSchool)}
        >
          {SUPPORTED_CALENDARS.map((option) => <option key={option} value={option}>{humanizeCalendar(option)}</option>)}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        {t('notificationTime')}
        <input
          className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
          type="time"
          value={props.preferences.notificationTime}
          onChange={(event) => props.onNotificationTimeChange(event.target.value)}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        {t('ayanamsa')}
        <input
          className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
          value={props.preferences.ayanamsa}
          onChange={(event) => props.onAyanamsaChange(event.target.value)}
        />
      </label>

      <button
        className="w-full rounded-2xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-700"
        onClick={() => void props.onSubscribePush()}
        type="button"
      >
        {props.pushReady ? t('subscribed') : t('subscribe')} {t('pushNotifications')}
      </button>

      <a className="block text-sm font-medium text-orange-700 underline" href="/README.md" target="_blank" rel="noreferrer">
        {t('howCalculated')}
      </a>
    </section>
  )
}

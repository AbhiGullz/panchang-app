import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AYANAMSA_OPTIONS, SUPPORTED_CALENDARS, SUPPORTED_LANGUAGE_OPTIONS } from '../types/api'
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
          <div className="min-w-0"><p className="text-sm font-medium text-slate-700">{t('location')}</p><p className="break-words font-semibold text-slate-900">{props.preferences.location.city}</p><details className="mt-1 text-xs text-slate-500"><summary className="cursor-pointer">{t('details')}</summary><span>{props.preferences.location.lat}, {props.preferences.location.lng} · {props.preferences.location.tz}</span></details></div>
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
          {SUPPORTED_LANGUAGE_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        {t('calendarSchool')}
        <select
          className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
          value={props.preferences.calendar}
          onChange={(event) => props.onCalendarChange(event.target.value as CalendarSchool)}
        >
          {SUPPORTED_CALENDARS.map((option) => <option key={option} value={option}>{humanizeCalendar(option, props.preferences.language)}</option>)}
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
        <select
          aria-label={t('ayanamsa')}
          className="mt-1 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
          value={props.preferences.ayanamsa}
          onChange={(event) => props.onAyanamsaChange(event.target.value)}
        >
          {AYANAMSA_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <button
        className="w-full rounded-2xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-700"
        onClick={() => void props.onSubscribePush()}
        type="button"
      >
        {props.pushReady ? t('subscribedPush') : t('subscribePush')}
      </button>

      <a className="block text-sm font-medium text-orange-700 underline" href="/README.md" target="_blank" rel="noreferrer">
        {t('howCalculated')}
      </a>
    </section>
  )
}

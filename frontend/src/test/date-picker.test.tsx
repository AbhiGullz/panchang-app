import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DatePicker } from '../components/DatePicker'
import { formatDateInput } from '../lib/utils'

afterEach(cleanup)
it('selects a day and exposes Today and Clear', () => {
  const change = vi.fn()
  render(<DatePicker value="2026-10-24" onChange={change} language="en" label="Date" />)
  fireEvent.click(screen.getByRole('button', { name: 'Date' }))
  fireEvent.click(screen.getByRole('button', { name: '2026-10-25' }))
  expect(change).toHaveBeenLastCalledWith('2026-10-25')
  fireEvent.click(screen.getByRole('button', { name: 'Date' }))
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
  expect(change).toHaveBeenLastCalledWith('')
  fireEvent.click(screen.getByRole('button', { name: 'Date' }))
  fireEvent.click(screen.getByRole('button', { name: 'Today' }))
  expect(change).toHaveBeenLastCalledWith(formatDateInput(new Date()))
})
it('localizes actions and closes on Escape', () => {
  render(<DatePicker value="2026-10-24" onChange={vi.fn()} language="hi" label="तारीख" />)
  fireEvent.click(screen.getByRole('button', { name: 'तारीख' }))
  expect(screen.getByRole('button', { name: 'आज' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'साफ़ करें' })).toBeInTheDocument()
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

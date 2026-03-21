import { activityColumns } from '@/data/friendsActivity'
import {
  FRIENDS_ENTRY_BUTTON_CANCEL,
  FRIENDS_ENTRY_BUTTON_SAVE,
  FRIENDS_ENTRY_BUTTON_SAVING,
  FRIENDS_ENTRY_ERROR_NETWORK,
  FRIENDS_ENTRY_ERROR_NOT_APPROVED_FALLBACK,
  FRIENDS_ENTRY_ERROR_REQUEST_FAILED,
  FRIENDS_ENTRY_LABEL_DAY,
  FRIENDS_ENTRY_LABEL_PASSWORD,
  FRIENDS_ENTRY_LABEL_USERNAME,
  FRIENDS_ENTRY_MODAL_INTRO_PARTS,
  FRIENDS_ENTRY_MODAL_TITLE,
  FRIENDS_ENTRY_PLACEHOLDER_METRIC_EMPTY,
  FRIENDS_OPTION_NO,
  FRIENDS_OPTION_YES,
} from '@/data/friendsMessages'
import { useEffect, useState } from 'react'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-100'

export default function FriendsEntryModal({
  isOpen,
  onClose,
  onEntrySaved,
  weekRows,
  selectedUsername,
  usernameOptions = [],
}) {
  const [username, setUsername] = useState(selectedUsername || '')
  const [date, setDate] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedUsername) setUsername(selectedUsername)
  }, [selectedUsername])

  useEffect(() => {
    if (weekRows?.length && !date) setDate(weekRows[0].date)
  }, [weekRows, date])

  useEffect(() => {
    const row = weekRows?.find((r) => r.date === date)
    if (!row) return
    const next = {}
    for (const col of activityColumns) {
      const v = row.entries[col.key]
      if (v === null || v === undefined) next[col.key] = ''
      else if (typeof v === 'boolean') next[col.key] = v ? 'yes' : 'no'
      else next[col.key] = String(v)
    }
    setForm(next)
  }, [date, weekRows])

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const entries = {}
      for (const col of activityColumns) {
        const raw = (form[col.key] ?? '').toString().trim()
        if (col.key === 'weightTraining') {
          if (raw === '') entries[col.key] = null
          else entries[col.key] = raw === 'yes' || raw === 'true'
        } else if (raw === '') {
          entries[col.key] = null
        } else {
          const n = Number(raw)
          if (!Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(raw)) entries[col.key] = n
          else entries[col.key] = raw
        }
      }

      const res = await fetch('/api/friends-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, date, entries, username }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'not_approved') {
          setError(data.error || FRIENDS_ENTRY_ERROR_NOT_APPROVED_FALLBACK)
        } else {
          setError(data.error || FRIENDS_ENTRY_ERROR_REQUEST_FAILED)
        }
        return
      }
      setPassword('')
      onClose?.()
      await onEntrySaved?.()
    } catch {
      setError(FRIENDS_ENTRY_ERROR_NETWORK)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="friends-entry-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 dark:bg-black/60"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-zinc-600 dark:bg-zinc-900">
        <h2 id="friends-entry-title" className="text-lg font-semibold text-zinc-900 dark:text-white">
          {FRIENDS_ENTRY_MODAL_TITLE}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {FRIENDS_ENTRY_MODAL_INTRO_PARTS.map((part, i) =>
            part.type === 'code' ? (
              <code key={i} className="text-xs">
                {part.value}
              </code>
            ) : (
              <span key={i}>{part.value}</span>
            )
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="friends-entry-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {FRIENDS_ENTRY_LABEL_USERNAME}
            </label>
            <select
              id="friends-entry-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            >
              {usernameOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="friends-user-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {FRIENDS_ENTRY_LABEL_PASSWORD}
            </label>
            <input
              id="friends-user-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="friends-entry-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {FRIENDS_ENTRY_LABEL_DAY}
            </label>
            <select
              id="friends-entry-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            >
              {(weekRows || []).map((r) => (
                <option key={r.date} value={r.date}>
                  {r.label} ({r.date})
                </option>
              ))}
            </select>
          </div>

          {activityColumns.map((col) => (
            <div key={col.key}>
              <label htmlFor={`fe-${col.key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {col.label}
              </label>
              {col.key === 'weightTraining' ? (
                <select
                  id={`fe-${col.key}`}
                  value={form[col.key] ?? ''}
                  onChange={(e) => setField(col.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="yes">{FRIENDS_OPTION_YES}</option>
                  <option value="no">{FRIENDS_OPTION_NO}</option>
                </select>
              ) : (
                <input
                  id={`fe-${col.key}`}
                  type="text"
                  inputMode="decimal"
                  value={form[col.key] ?? ''}
                  onChange={(e) => setField(col.key, e.target.value)}
                  placeholder={FRIENDS_ENTRY_PLACEHOLDER_METRIC_EMPTY}
                  className={inputClass}
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? FRIENDS_ENTRY_BUTTON_SAVING : FRIENDS_ENTRY_BUTTON_SAVE}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-200 dark:hover:bg-zinc-800"
            >
              {FRIENDS_ENTRY_BUTTON_CANCEL}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

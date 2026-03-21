import { useState } from 'react'
import {
  FRIENDS_SIGNUP_BUTTON_CANCEL,
  FRIENDS_SIGNUP_BUTTON_CLOSE,
  FRIENDS_SIGNUP_BUTTON_SUBMIT,
  FRIENDS_SIGNUP_BUTTON_SUBMITTING,
  FRIENDS_SIGNUP_ERROR_NETWORK,
  FRIENDS_SIGNUP_ERROR_REQUEST_FAILED,
  FRIENDS_SIGNUP_HINT_KNOW_ME,
  FRIENDS_SIGNUP_HINT_USERNAME,
  FRIENDS_SIGNUP_LABEL_KNOW_ME,
  FRIENDS_SIGNUP_LABEL_PASSWORD,
  FRIENDS_SIGNUP_LABEL_USERNAME,
  MESSAGE_FRIEND_SIGNUP_AFTER_SUBMIT,
  MESSAGE_TO_FRIEND_SIGNUP_MODAL,
  FRIENDS_SIGNUP_MODAL_TITLE,
  FRIENDS_SIGNUP_PLACEHOLDER_KNOW_ME,
  FRIENDS_SIGNUP_USERNAME_INPUT_TITLE,
} from '@/data/friendsMessages'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-100'

export default function FriendsSignupModal({ isOpen, onClose }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [knowMeNote, setKnowMeNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function resetAndClose() {
    setUsername('')
    setPassword('')
    setKnowMeNote('')
    setError('')
    setDone(false)
    onClose?.()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/friends-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, knowMeNote }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || FRIENDS_SIGNUP_ERROR_REQUEST_FAILED)
        return
      }
      setDone(true)
      setPassword('')
    } catch {
      setError(FRIENDS_SIGNUP_ERROR_NETWORK)
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
      aria-labelledby="friends-signup-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 dark:bg-black/60"
        aria-label="Close dialog"
        onClick={resetAndClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-zinc-600 dark:bg-zinc-900">
        <h2 id="friends-signup-title" className="text-lg font-semibold text-zinc-900 dark:text-white">
          {FRIENDS_SIGNUP_MODAL_TITLE}
        </h2>

        {done ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {MESSAGE_FRIEND_SIGNUP_AFTER_SUBMIT}
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {FRIENDS_SIGNUP_BUTTON_CLOSE}
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              {MESSAGE_TO_FRIEND_SIGNUP_MODAL}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="friends-signup-user"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {FRIENDS_SIGNUP_LABEL_USERNAME}
                </label>
                <input
                  id="friends-signup-user"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className={inputClass}
                  minLength={2}
                  maxLength={32}
                  pattern="[a-z0-9]{2,32}"
                  required
                  title={FRIENDS_SIGNUP_USERNAME_INPUT_TITLE}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{FRIENDS_SIGNUP_HINT_USERNAME}</p>
              </div>

              <div>
                <label
                  htmlFor="friends-signup-pass"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {FRIENDS_SIGNUP_LABEL_PASSWORD}
                </label>
                <input
                  id="friends-signup-pass"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="friends-signup-know"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {FRIENDS_SIGNUP_LABEL_KNOW_ME}
                </label>
                <textarea
                  id="friends-signup-know"
                  value={knowMeNote}
                  onChange={(e) => setKnowMeNote(e.target.value)}
                  rows={4}
                  className={inputClass}
                  minLength={20}
                  maxLength={2000}
                  required
                  placeholder={FRIENDS_SIGNUP_PLACEHOLDER_KNOW_ME}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{FRIENDS_SIGNUP_HINT_KNOW_ME}</p>
              </div>

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
                  {loading ? FRIENDS_SIGNUP_BUTTON_SUBMITTING : FRIENDS_SIGNUP_BUTTON_SUBMIT}
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-200 dark:hover:bg-zinc-800"
                >
                  {FRIENDS_SIGNUP_BUTTON_CANCEL}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

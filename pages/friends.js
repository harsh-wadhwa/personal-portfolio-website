import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import FriendsEntryModal from '@/components/FriendsEntryModal'
import FriendsSignupModal from '@/components/FriendsSignupModal'
import siteMetadata from '@/data/siteMetadata'
import { activityColumns } from '@/data/friendsActivity'
import {
  FRIENDS_CHARTS_LOADING,
  FRIENDS_OPTION_NO,
  FRIENDS_OPTION_YES,
  FRIENDS_PAGE_BUTTON_LOG_ENTRY,
  FRIENDS_PAGE_BUTTON_REQUEST_ACCESS,
  FRIENDS_PAGE_CHOOSE_USERNAME_BANNER,
  FRIENDS_PAGE_ERROR_LOAD_FAILED,
  FRIENDS_PAGE_HEADING,
  FRIENDS_PAGE_LABEL_USER,
  FRIENDS_PAGE_LINK_NEXT_WEEK,
  FRIENDS_PAGE_LINK_PREV_WEEK,
  FRIENDS_PAGE_LINK_THIS_WEEK,
  FRIENDS_PAGE_LOADING_USERS,
  FRIENDS_PAGE_LOADING_WEEK,
  FRIENDS_PAGE_MONGO_NOT_CONFIGURED_AFTER,
  FRIENDS_PAGE_MONGO_NOT_CONFIGURED_BEFORE,
  FRIENDS_PAGE_MONGO_NOT_CONFIGURED_CODE,
  FRIENDS_PAGE_NO_APPROVED_FRIENDS_AFTER,
  FRIENDS_PAGE_NO_APPROVED_FRIENDS_BEFORE,
  FRIENDS_PAGE_NO_APPROVED_SIGNUP_CLOSED,
  FRIENDS_PAGE_NO_APPROVED_FRIENDS_STRONG,
  FRIENDS_PAGE_RATE_LIMIT_TRY_AGAIN,
  FRIENDS_PAGE_ROSTER_LOAD_ERROR,
  FRIENDS_PAGE_SEO_DESCRIPTION,
  FRIENDS_PAGE_SEO_TITLE_PREFIX,
  FRIENDS_PAGE_TABLE_SELECT_USER,
  FRIENDS_PAGE_USER_ONE_TIME_HINT,
  FRIENDS_PAGE_USER_OPTION_CHOOSE,
  FRIENDS_PAGE_USER_OPTION_SELECT,
  FRIENDS_PAGE_WEEK_OF_PREFIX,
  FRIENDS_TABLE_HEADING_DATE,
} from '@/data/friendsMessages'
import { getFriendsReadLimiter } from '@/lib/friendsRateLimitConfig'
import { getClientIp } from '@/lib/requestIp'
import { friendsLog } from '@/lib/friendsDebugLog'
import {
  resolveWeekMondayFromQuery,
  shiftWeekMonday,
  weekRangeFromMonday,
} from '@/lib/friendsWeek'
import { PageSEO } from '@/components/SEO'

const FRIENDS_SELECTED_USER_STORAGE_KEY = 'friendsTrackerSelectedUser_v1'

/** Server-only: set FRIENDS_NOINDEX=1 to ask crawlers not to index /friends. */
const FRIENDS_PAGE_NOINDEX =
  process.env.FRIENDS_NOINDEX === '1' || /^true$/i.test(process.env.FRIENDS_NOINDEX || '')

/** Server-only: set FRIENDS_DISABLE_SIGNUP=1 to block POST /api/friends-signup and hide the UI. */
const FRIENDS_SIGNUP_DISABLED =
  process.env.FRIENDS_DISABLE_SIGNUP === '1' || /^true$/i.test(process.env.FRIENDS_DISABLE_SIGNUP || '')

function formatCell(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? FRIENDS_OPTION_YES : FRIENDS_OPTION_NO
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}

function friendsErrorProps(message) {
  return {
    props: {
      rateLimited: false,
      retryAfterMs: 0,
      weekLabel: '',
      mondayISO: '',
      prevMondayISO: '',
      nextMondayISO: '',
      mongoConfigured: !!process.env.MONGODB_URI,
      pageLoadError: message,
      friendsSeoNoIndex: FRIENDS_PAGE_NOINDEX,
      friendsSignupDisabled: FRIENDS_SIGNUP_DISABLED,
    },
  }
}

export async function getServerSideProps(ctx) {
  try {
    const ip = getClientIp(ctx.req)
    const limit = getFriendsReadLimiter()
    const { ok, retryAfterMs } = limit(ip)

    if (!ok) {
      friendsLog('ssr:rateLimited', { retryAfterMs })
      return {
        props: {
          rateLimited: true,
          retryAfterMs,
          weekLabel: '',
          mondayISO: '',
          prevMondayISO: '',
          nextMondayISO: '',
          mongoConfigured: !!process.env.MONGODB_URI,
          pageLoadError: null,
          friendsSeoNoIndex: FRIENDS_PAGE_NOINDEX,
          friendsSignupDisabled: FRIENDS_SIGNUP_DISABLED,
        },
      }
    }

    const monday = resolveWeekMondayFromQuery(ctx.query)
    const { mondayISO, sundayISO } = weekRangeFromMonday(monday)
    const prevMondayISO = shiftWeekMonday(monday, -1).toISODate()
    const nextMondayISO = shiftWeekMonday(monday, 1).toISODate()
    const weekLabel = `${monday.toFormat('d LLL')} – ${monday.plus({ days: 6 }).toFormat('d LLL, yyyy')}`

    friendsLog('ssr:week', {
      query: ctx.query,
      mondayISO,
      sundayISO,
      timezone: process.env.FRIENDS_TIMEZONE || 'UTC',
    })

    return {
      props: {
        rateLimited: false,
        retryAfterMs: 0,
        weekLabel,
        mondayISO,
        prevMondayISO,
        nextMondayISO,
        mongoConfigured: !!process.env.MONGODB_URI,
        pageLoadError: null,
        friendsSeoNoIndex: FRIENDS_PAGE_NOINDEX,
        friendsSignupDisabled: FRIENDS_SIGNUP_DISABLED,
      },
    }
  } catch (err) {
    console.error('[pages/friends getServerSideProps]', err)
    return friendsErrorProps(FRIENDS_PAGE_ERROR_LOAD_FAILED)
  }
}

/** Week navigation only — username is stored in localStorage, not the URL. */
function friendsWeekHref(weekISO) {
  return `/friends?week=${encodeURIComponent(weekISO)}`
}

/** Client-only dynamic import keeps Recharts out of the main page bundle (avoids flaky next/dynamic in dev). */
function FriendsMetricChartsLazy({ rows }) {
  const [Comp, setComp] = useState(null)
  useEffect(() => {
    let cancelled = false
    import('@/components/FriendsMetricCharts').then((m) => {
      if (!cancelled) setComp(() => m.default)
    })
    return () => {
      cancelled = true
    }
  }, [])
  if (!Comp) {
    return <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">{FRIENDS_CHARTS_LOADING}</p>
  }
  return <Comp rows={rows} />
}

export default function Friends({
  weekLabel,
  mondayISO,
  prevMondayISO,
  nextMondayISO,
  rateLimited,
  retryAfterMs,
  mongoConfigured,
  pageLoadError,
  friendsSeoNoIndex,
  friendsSignupDisabled,
}) {
  const [entryOpen, setEntryOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  const [rosterLoading, setRosterLoading] = useState(true)
  const [rosterError, setRosterError] = useState(false)
  const [usernameOptions, setUsernameOptions] = useState([])

  const [selectedUsername, setSelectedUsername] = useState(null)
  const [needsUserPick, setNeedsUserPick] = useState(false)

  const [activityLoading, setActivityLoading] = useState(false)
  const [friendsActivityWeek, setFriendsActivityWeek] = useState([])

  const friendsRosterReady = usernameOptions.length > 0

  /** Silent GET after log entry — updates table + charts without full page refresh. */
  const refreshFriendsActivityAfterEntry = useCallback(async () => {
    if (rateLimited || !selectedUsername || !mondayISO) return
    try {
      const q = new URLSearchParams({ week: mondayISO, user: selectedUsername })
      const res = await fetch(`/api/friends-activity?${q}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return
      setFriendsActivityWeek(Array.isArray(data.friendsActivityWeek) ? data.friendsActivityWeek : [])
    } catch {
      /* keep existing rows */
    }
  }, [rateLimited, selectedUsername, mondayISO])

  useEffect(() => {
    if (rateLimited || pageLoadError || !mongoConfigured) {
      setRosterLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setRosterLoading(true)
      setRosterError(false)
      try {
        const res = await fetch('/api/friends-roster')
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setRosterError(true)
          setUsernameOptions([])
          return
        }
        const list = Array.isArray(data.usernames) ? data.usernames : []
        setUsernameOptions(list)

        if (list.length === 0) {
          setSelectedUsername(null)
          setNeedsUserPick(false)
          setFriendsActivityWeek([])
          return
        }

        let stored = null
        try {
          stored = localStorage.getItem(FRIENDS_SELECTED_USER_STORAGE_KEY)
        } catch {
          stored = null
        }
        const normalized = stored && list.includes(stored) ? stored : null

        if (normalized) {
          setSelectedUsername(normalized)
          setNeedsUserPick(false)
        } else {
          setSelectedUsername(null)
          setNeedsUserPick(true)
          setFriendsActivityWeek([])
        }
      } catch {
        if (!cancelled) {
          setRosterError(true)
          setUsernameOptions([])
        }
      } finally {
        if (!cancelled) setRosterLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [rateLimited, pageLoadError, mongoConfigured])

  useEffect(() => {
    if (rateLimited || !selectedUsername || !mondayISO) {
      if (!selectedUsername) setFriendsActivityWeek([])
      return
    }

    let cancelled = false
    ;(async () => {
      setActivityLoading(true)
      try {
        const q = new URLSearchParams({ week: mondayISO, user: selectedUsername })
        const res = await fetch(`/api/friends-activity?${q}`)
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setFriendsActivityWeek([])
          return
        }
        setFriendsActivityWeek(Array.isArray(data.friendsActivityWeek) ? data.friendsActivityWeek : [])
      } catch {
        if (!cancelled) setFriendsActivityWeek([])
      } finally {
        if (!cancelled) setActivityLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedUsername, mondayISO, rateLimited])

  function handleUserChange(u) {
    try {
      localStorage.setItem(FRIENDS_SELECTED_USER_STORAGE_KEY, u)
    } catch {
      /* ignore quota / private mode */
    }
    setSelectedUsername(u)
    setNeedsUserPick(false)
  }

  const showMainLoader = !rateLimited && mongoConfigured && !pageLoadError && rosterLoading
  const showActivityLoader =
    !rateLimited && mongoConfigured && selectedUsername && activityLoading && !needsUserPick

  return (
    <>
      <PageSEO
        title={`${FRIENDS_PAGE_SEO_TITLE_PREFIX} - ${siteMetadata.author}`}
        description={FRIENDS_PAGE_SEO_DESCRIPTION}
        robots={friendsSeoNoIndex ? 'noindex, nofollow' : undefined}
      />
      <div className="space-y-2 pt-6 pb-4 md:space-y-5">
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-zinc-800 dark:text-white md:text-5xl">
          {FRIENDS_PAGE_HEADING}
        </h1>

        {/* Row 1: user + request access */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          {!rateLimited && friendsRosterReady && !rosterLoading && (
            <label className="flex min-w-[12rem] max-w-md flex-1 flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">{FRIENDS_PAGE_LABEL_USER}</span>
              <select
                value={selectedUsername || ''}
                onChange={(e) => handleUserChange(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-100"
              >
                <option value="" disabled>
                  {needsUserPick ? FRIENDS_PAGE_USER_OPTION_CHOOSE : FRIENDS_PAGE_USER_OPTION_SELECT}
                </option>
                {usernameOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500 dark:text-gray-500">{FRIENDS_PAGE_USER_ONE_TIME_HINT}</span>
            </label>
          )}
          {!rateLimited && mongoConfigured && !friendsSignupDisabled && (
            <button
              type="button"
              onClick={() => setSignupOpen(true)}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-200 dark:hover:bg-zinc-800"
            >
              {FRIENDS_PAGE_BUTTON_REQUEST_ACCESS}
            </button>
          )}
        </div>

        {/* Row 2: week label + week nav + log entry */}
        {!rateLimited && mondayISO && (
          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-zinc-700 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {FRIENDS_PAGE_WEEK_OF_PREFIX}
              <span className="font-medium text-zinc-700 dark:text-gray-300">{weekLabel}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {mongoConfigured && friendsRosterReady && selectedUsername && !needsUserPick && (
                <button
                  type="button"
                  onClick={() => setEntryOpen(true)}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  {FRIENDS_PAGE_BUTTON_LOG_ENTRY}
                </button>
              )}
              <Link href={friendsWeekHref(prevMondayISO)}>
                <a className="inline-flex rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-zinc-800">
                  {FRIENDS_PAGE_LINK_PREV_WEEK}
                </a>
              </Link>
              <Link href="/friends">
                <a className="inline-flex rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-zinc-800">
                  {FRIENDS_PAGE_LINK_THIS_WEEK}
                </a>
              </Link>
              <Link href={friendsWeekHref(nextMondayISO)}>
                <a className="inline-flex rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-zinc-800">
                  {FRIENDS_PAGE_LINK_NEXT_WEEK}
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>

      {pageLoadError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
          {pageLoadError}
        </p>
      )}

      {!mongoConfigured && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {FRIENDS_PAGE_MONGO_NOT_CONFIGURED_BEFORE}
          <code className="text-xs">{FRIENDS_PAGE_MONGO_NOT_CONFIGURED_CODE}</code>
          {FRIENDS_PAGE_MONGO_NOT_CONFIGURED_AFTER}
        </p>
      )}

      {mongoConfigured && !rosterLoading && !friendsRosterReady && !rosterError && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {friendsSignupDisabled ? (
            FRIENDS_PAGE_NO_APPROVED_SIGNUP_CLOSED
          ) : (
            <>
              {FRIENDS_PAGE_NO_APPROVED_FRIENDS_BEFORE}
              <strong>{FRIENDS_PAGE_NO_APPROVED_FRIENDS_STRONG}</strong>
              {FRIENDS_PAGE_NO_APPROVED_FRIENDS_AFTER}
            </>
          )}
        </p>
      )}

      {rosterError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
          {FRIENDS_PAGE_ROSTER_LOAD_ERROR}
        </p>
      )}

      {rateLimited && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
          {FRIENDS_PAGE_RATE_LIMIT_TRY_AGAIN(Math.ceil(retryAfterMs / 1000))}
        </p>
      )}

      {showMainLoader && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{FRIENDS_PAGE_LOADING_USERS}</p>
      )}

      {needsUserPick && friendsRosterReady && !rosterLoading && (
        <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-100">
          {FRIENDS_PAGE_CHOOSE_USERNAME_BANNER}
        </p>
      )}

      {showActivityLoader && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{FRIENDS_PAGE_LOADING_WEEK}</p>
      )}

      {!rateLimited && friendsRosterReady && mongoConfigured && selectedUsername && !needsUserPick && (
        <FriendsEntryModal
          isOpen={entryOpen}
          onClose={() => setEntryOpen(false)}
          onEntrySaved={refreshFriendsActivityAfterEntry}
          weekRows={friendsActivityWeek}
          selectedUsername={selectedUsername}
          usernameOptions={usernameOptions}
        />
      )}

      {!rateLimited && mongoConfigured && !friendsSignupDisabled && (
        <FriendsSignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
      )}

      {!rateLimited && selectedUsername && !needsUserPick && !activityLoading && (
        <FriendsMetricChartsLazy rows={friendsActivityWeek} />
      )}

      <div className="pb-12 pt-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:shadow-none">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/80">
                <th
                  scope="col"
                  className="sticky left-0 z-10 whitespace-nowrap border-b border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-zinc-800 dark:text-gray-100"
                >
                  {FRIENDS_TABLE_HEADING_DATE}
                </th>
                {activityColumns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-zinc-900">
              {needsUserPick && friendsRosterReady && !rosterLoading ? (
                <tr>
                  <td
                    colSpan={activityColumns.length + 1}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {FRIENDS_PAGE_TABLE_SELECT_USER}
                  </td>
                </tr>
              ) : (
                friendsActivityWeek.map((row) => (
                  <tr
                    key={row.date}
                    className="transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/40"
                  >
                    <th
                      scope="row"
                      className="sticky left-0 z-10 whitespace-nowrap border-gray-200 bg-white px-4 py-3 font-medium text-gray-900 dark:border-gray-700 dark:bg-zinc-900 dark:text-gray-100"
                    >
                      <time dateTime={row.date}>{row.label}</time>
                    </th>
                    {activityColumns.map((col) => (
                      <td
                        key={col.key}
                        className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300"
                      >
                        {formatCell(row.entries[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
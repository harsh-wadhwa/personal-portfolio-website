import { activityColumns, mergeWeekRows } from '@/data/friendsActivity'
import { isUrlFriendlyFriendsUsername } from '@/data/friendsUsernames'
import { getLatestEntriesByDate } from '@/lib/friendsActivityDb'
import { getFriendsReadLimiter } from '@/lib/friendsRateLimitConfig'
import { getFriendsUsernamesSorted } from '@/lib/friendsRosterDb'
import { getClientIp } from '@/lib/requestIp'
import { resolveWeekMondayFromQuery, weekRangeFromMonday } from '@/lib/friendsWeek'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  const { ok, retryAfterMs } = getFriendsReadLimiter()(ip)
  if (!ok) {
    res.setHeader('Retry-After', String(Math.ceil(retryAfterMs / 1000) || 1))
    return res.status(429).json({ error: 'Too many requests', retryAfterMs })
  }

  try {
    const usernameOptions = (await getFriendsUsernamesSorted()) || []
    const monday = resolveWeekMondayFromQuery(req.query)
    const { mondayISO, sundayISO, days } = weekRangeFromMonday(monday)

    if (usernameOptions.length === 0) {
      const friendsActivityWeek = mergeWeekRows(days, {})
      return res.status(200).json({
        activityColumns,
        friendsActivityWeek,
        mondayISO,
        sundayISO,
        selectedUsername: null,
        friendsRosterReady: false,
      })
    }

    const raw = req.query.user ?? req.query.u
    const u = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
    const allowed = new Set(usernameOptions)
    if (!isUrlFriendlyFriendsUsername(u) || !allowed.has(u)) {
      return res.status(400).json({
        error: 'Query user (or u) must be an approved username.',
        usernames: usernameOptions,
      })
    }

    const latestByDate = await getLatestEntriesByDate(mondayISO, sundayISO, u)
    const friendsActivityWeek = mergeWeekRows(days, latestByDate)

    return res.status(200).json({
      activityColumns,
      friendsActivityWeek,
      mondayISO,
      sundayISO,
      selectedUsername: u,
      friendsRosterReady: true,
    })
  } catch (e) {
    console.error('[api/friends-activity]', e)
    return res.status(500).json({ error: 'Server error' })
  }
}

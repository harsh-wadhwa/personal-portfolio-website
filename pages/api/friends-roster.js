import { getFriendsUsernamesSorted } from '@/lib/friendsRosterDb'
import { getFriendsReadLimiter } from '@/lib/friendsRateLimitConfig'
import { getClientIp } from '@/lib/requestIp'

/** GET — approved usernames only (for client picker + validation). */
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
    const usernames = (await getFriendsUsernamesSorted()) || []
    return res.status(200).json({ usernames })
  } catch (e) {
    console.error('[api/friends-roster]', e)
    return res.status(500).json({ error: 'Server error' })
  }
}

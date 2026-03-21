import { DEFAULT_FRIENDS_USERNAME, isUrlFriendlyFriendsUsername } from '@/data/friendsUsernames'
import { insertFriendsActivityEntry } from '@/lib/friendsActivityDb'
import { sanitizeEntriesPayload } from '@/lib/friendsEntrySanitize'
import { getFriendsWriteLimiter } from '@/lib/friendsRateLimitConfig'
import {
  findFriendsRosterByUsername,
  isFriendsRosterApproved,
  verifyFriendsRosterPasswordAgainstDoc,
} from '@/lib/friendsRosterDb'
import { getDb } from '@/lib/mongodb'
import { getClientIp } from '@/lib/requestIp'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const config = {
  api: {
    bodyParser: { sizeLimit: '32kb' },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  const { ok, retryAfterMs } = getFriendsWriteLimiter()(ip)
  if (!ok) {
    res.setHeader('Retry-After', String(Math.ceil(retryAfterMs / 1000) || 1))
    return res.status(429).json({ error: 'Too many requests', retryAfterMs })
  }

  const db = await getDb()
  if (!db) {
    return res.status(503).json({ error: 'MongoDB is not configured' })
  }

  const { password, date, entries: rawEntries, username: rawUsername } = req.body || {}

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password required' })
  }

  const username =
    typeof rawUsername === 'string' && rawUsername.trim()
      ? rawUsername.trim().toLowerCase()
      : DEFAULT_FRIENDS_USERNAME

  if (!isUrlFriendlyFriendsUsername(username)) {
    return res.status(400).json({
      error:
        'Username must be 2–32 characters and use only lowercase letters a–z and digits 0–9 (URL-safe).',
    })
  }

  const doc = await findFriendsRosterByUsername(username)
  if (!doc) {
    return res.status(400).json({ error: 'Invalid username' })
  }

  if (!verifyFriendsRosterPasswordAgainstDoc(doc, password)) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  if (!isFriendsRosterApproved(doc)) {
    return res.status(403).json({
      error:
        'This account is not approved yet. The site owner must set rules.approved to true on your friends document in MongoDB before you can log entries.',
      code: 'not_approved',
    })
  }

  if (!date || typeof date !== 'string' || !DATE_RE.test(date)) {
    return res.status(400).json({ error: 'Invalid date (use YYYY-MM-DD)' })
  }

  const entries = sanitizeEntriesPayload(rawEntries)

  try {
    await insertFriendsActivityEntry({ date, entries, source: 'web', username })
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[api/friends-entry]', e)
    return res.status(500).json({ error: 'Save failed' })
  }
}

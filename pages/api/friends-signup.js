import { isUrlFriendlyFriendsUsername } from '@/data/friendsUsernames'
import { hashFriendsPassword } from '@/lib/friendsPasswordCrypto'
import {
  friendsRosterUsernameExists,
  insertFriendsRosterPendingSignup,
} from '@/lib/friendsRosterDb'
import { getFriendsSignupLimiter } from '@/lib/friendsRateLimitConfig'
import { getDb } from '@/lib/mongodb'
import { getClientIp, getFriendsSignupClientMeta } from '@/lib/requestIp'

const PASSWORD_MIN = 8
const PASSWORD_MAX = 128
const KNOW_ME_MIN = 20
const KNOW_ME_MAX = 2000

export const config = {
  api: {
    bodyParser: { sizeLimit: '24kb' },
  },
}

function envTruthy(name) {
  const v = process.env[name]
  return v === '1' || /^true$/i.test(String(v || ''))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (envTruthy('FRIENDS_DISABLE_SIGNUP')) {
    return res.status(403).json({ error: 'Signup is disabled.' })
  }

  const ip = getClientIp(req)
  const { ok, retryAfterMs } = getFriendsSignupLimiter()(ip)
  if (!ok) {
    res.setHeader('Retry-After', String(Math.ceil(retryAfterMs / 1000) || 1))
    return res.status(429).json({ error: 'Too many signup attempts. Try again later.', retryAfterMs })
  }

  const db = await getDb()
  if (!db) {
    return res.status(503).json({ error: 'MongoDB is not configured' })
  }

  const { username: rawUser, password, knowMeNote: rawNote } = req.body || {}

  if (typeof rawUser !== 'string' || !rawUser.trim()) {
    return res.status(400).json({ error: 'Username required' })
  }
  const username = rawUser.trim().toLowerCase()
  if (!isUrlFriendlyFriendsUsername(username)) {
    return res.status(400).json({
      error: 'Username must be 2–32 characters, lowercase letters a–z and digits 0–9 only.',
    })
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN) {
    return res.status(400).json({ error: `Password must be at least ${PASSWORD_MIN} characters.` })
  }
  if (password.length > PASSWORD_MAX) {
    return res.status(400).json({ error: 'Password is too long.' })
  }

  if (typeof rawNote !== 'string') {
    return res.status(400).json({ error: 'Please tell me how we know each other.' })
  }
  const knowMeNote = rawNote.trim()
  if (knowMeNote.length < KNOW_ME_MIN) {
    return res.status(400).json({
      error: `Please write at least ${KNOW_ME_MIN} characters so I can recognize you (how we know each other).`,
    })
  }
  if (knowMeNote.length > KNOW_ME_MAX) {
    return res.status(400).json({ error: 'That message is too long.' })
  }

  const taken = await friendsRosterUsernameExists(username)
  if (taken) {
    return res.status(409).json({ error: 'That username is already taken.' })
  }

  try {
    const passwordScrypt = hashFriendsPassword(password)
    const client = getFriendsSignupClientMeta(req)
    await insertFriendsRosterPendingSignup({
      username,
      passwordScrypt,
      signupInfo: {
        knowMeNote,
        ip: client.ip,
        userAgent: client.userAgent,
        acceptLanguage: client.acceptLanguage,
        forwardedFor: client.forwardedFor,
      },
    })
    return res.status(201).json({ ok: true })
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ error: 'That username is already taken.' })
    }
    console.error('[api/friends-signup]', e)
    return res.status(500).json({ error: 'Signup failed' })
  }
}

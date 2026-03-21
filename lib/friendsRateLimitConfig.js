import { createRateLimiter } from '@/lib/rateLimit'

/**
 * Swap implementation: replace `createRateLimiter` usage here with a Redis/Upstash-backed
 * limiter that exposes the same `(id) => { ok, remaining, retryAfterMs }` shape.
 *
 * Env:
 * - FRIENDS_RATE_LIMIT_WINDOW_MS (default 60000)
 * - FRIENDS_RATE_LIMIT_MAX (default 30) — max requests per window per IP; 0 = disabled
 */
function readLimit() {
  const windowMs = parseInt(process.env.FRIENDS_RATE_LIMIT_WINDOW_MS || '60000', 10)
  const max = parseInt(process.env.FRIENDS_RATE_LIMIT_MAX || '30', 10)
  return {
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000,
    max: Number.isFinite(max) ? max : 30,
  }
}

function readWriteLimit() {
  const windowMs = parseInt(process.env.FRIENDS_WRITE_RATE_LIMIT_WINDOW_MS || '60000', 10)
  const max = parseInt(process.env.FRIENDS_WRITE_RATE_LIMIT_MAX || '20', 10)
  return {
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000,
    max: Number.isFinite(max) ? max : 20,
  }
}

function signupLimit() {
  const windowMs = parseInt(process.env.FRIENDS_SIGNUP_RATE_LIMIT_WINDOW_MS || '3600000', 10)
  const max = parseInt(process.env.FRIENDS_SIGNUP_RATE_LIMIT_MAX || '5', 10)
  return {
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 3_600_000,
    max: Number.isFinite(max) ? max : 5,
  }
}

let cachedFriendsRead
let cachedFriendsWrite
let cachedFriendsSignup

/** SSR + GET /api/friends-activity (Mongo-backed). */
export function getFriendsReadLimiter() {
  if (!cachedFriendsRead) {
    const { windowMs, max } = readLimit()
    cachedFriendsRead = createRateLimiter({ windowMs, max, name: 'friends-read' })
  }
  return cachedFriendsRead
}

/** POST /api/friends-entry — separate cap; set FRIENDS_WRITE_RATE_LIMIT_MAX=0 to disable. */
export function getFriendsWriteLimiter() {
  if (!cachedFriendsWrite) {
    const { windowMs, max } = readWriteLimit()
    cachedFriendsWrite = createRateLimiter({ windowMs, max, name: 'friends-write' })
  }
  return cachedFriendsWrite
}

/** POST /api/friends-signup — default 5/hour per IP; FRIENDS_SIGNUP_RATE_LIMIT_MAX=0 disables. */
export function getFriendsSignupLimiter() {
  if (!cachedFriendsSignup) {
    const { windowMs, max } = signupLimit()
    cachedFriendsSignup = createRateLimiter({ windowMs, max, name: 'friends-signup' })
  }
  return cachedFriendsSignup
}

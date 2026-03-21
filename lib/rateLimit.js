/**
 * In-memory sliding-window rate limiter (per Node process).
 * For multi-instance / serverless, swap for Redis (e.g. Upstash) behind the same API.
 *
 * Disable limiting: set max to 0 via env (see `friendsRateLimitConfig.js`).
 */

const buckets = new Map()

function sweepStale(now) {
  for (const [key, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(key)
  }
}

if (typeof setInterval !== 'undefined') {
  const t = setInterval(() => sweepStale(Date.now()), 60_000)
  if (typeof t.unref === 'function') t.unref()
}

/**
 * @param {{ windowMs: number; max: number; name?: string }} opts max 0 = unlimited
 */
export function createRateLimiter({ windowMs, max, name = 'default' }) {
  if (!Number.isFinite(max) || max <= 0) {
    return function unlimited() {
      return { ok: true, remaining: Infinity, retryAfterMs: 0 }
    }
  }

  return function consume(identifier) {
    const key = `${name}:${identifier}`
    const now = Date.now()
    let b = buckets.get(key)
    if (!b || now >= b.resetAt) {
      b = { count: 0, resetAt: now + windowMs }
      buckets.set(key, b)
    }
    if (b.count >= max) {
      return { ok: false, remaining: 0, retryAfterMs: Math.max(0, b.resetAt - now) }
    }
    b.count += 1
    return { ok: true, remaining: max - b.count, retryAfterMs: 0 }
  }
}

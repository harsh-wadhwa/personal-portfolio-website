/**
 * Best-effort client IP for rate limiting behind proxies (Vercel, nginx).
 * @param {import('http').IncomingMessage} req
 */
export function getClientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim()
  }
  if (Array.isArray(xff) && xff[0]) {
    return String(xff[0]).split(',')[0].trim()
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string') return realIp.trim()
  return req.socket?.remoteAddress || 'unknown'
}

/**
 * Stable client signals for roster signupInfo (IP + UA + optional proxy header).
 * Local dev often shows ::1 or 127.0.0.1 — that is the real loopback address, not an error.
 * @param {import('http').IncomingMessage} req
 */
export function getFriendsSignupClientMeta(req) {
  const xff = req.headers['x-forwarded-for']
  const forwardedFor = typeof xff === 'string' && xff.trim() ? xff.trim().slice(0, 512) : ''
  const ua = req.headers['user-agent']
  const userAgent = typeof ua === 'string' ? ua.trim().slice(0, 512) : ''
  const al = req.headers['accept-language']
  const acceptLanguage = typeof al === 'string' ? al.trim().slice(0, 128) : ''
  return {
    ip: getClientIp(req),
    forwardedFor,
    userAgent,
    acceptLanguage,
  }
}

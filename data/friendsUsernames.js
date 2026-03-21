export const DEFAULT_FRIENDS_USERNAME = 'hwadhwa'

/** Lowercase ASCII letters and digits only — safe for usernames. */
export const FRIENDS_USERNAME_MIN_LEN = 2
export const FRIENDS_USERNAME_MAX_LEN = 32

const USERNAME_RE = /^[a-z0-9]{2,32}$/

export function isUrlFriendlyFriendsUsername(name) {
  if (typeof name !== 'string') return false
  const u = name.trim().toLowerCase()
  return USERNAME_RE.test(u)
}

export function normalizeFriendsUsername(name) {
  if (typeof name !== 'string') return null
  const u = name.trim().toLowerCase()
  return USERNAME_RE.test(u) ? u : null
}

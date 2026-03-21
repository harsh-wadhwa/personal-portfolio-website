import crypto from 'crypto'

const SCRYPT_KEYLEN = 64
const SCRYPT_OPTS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
}

/** `passwordScrypt` field: `${saltB64}.${keyB64}` (matches `npm run friends:hash-password`). */
export function hashFriendsPassword(plain) {
  const salt = crypto.randomBytes(16)
  const key = crypto.scryptSync(String(plain), salt, SCRYPT_KEYLEN, SCRYPT_OPTS)
  return `${salt.toString('base64')}.${key.toString('base64')}`
}

export function verifyFriendsPasswordScrypt(plain, line) {
  if (plain === undefined || plain === null || typeof line !== 'string' || !line.trim()) return false
  const parts = line.trim().split('.')
  if (parts.length !== 2) return false
  try {
    const salt = Buffer.from(parts[0], 'base64')
    const expected = Buffer.from(parts[1], 'base64')
    if (expected.length !== SCRYPT_KEYLEN) return false
    const derived = crypto.scryptSync(String(plain), salt, SCRYPT_KEYLEN, SCRYPT_OPTS)
    return crypto.timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

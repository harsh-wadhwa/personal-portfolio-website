/**
 * Print a passwordScrypt line for the friends roster (Node crypto.scrypt).
 *
 *   npm run friends:hash-password -- 'your-secret'
 */
const crypto = require('crypto')

const SCRYPT_KEYLEN = 64
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

const plain = process.argv[2]
if (!plain) {
  console.error('Usage: npm run friends:hash-password -- yourpassword')
  process.exit(1)
}

const salt = crypto.randomBytes(16)
const key = crypto.scryptSync(String(plain), salt, SCRYPT_KEYLEN, SCRYPT_OPTS)
const line = `${salt.toString('base64')}.${key.toString('base64')}`

console.log(
  '\nSet on the friends document:\n  passwordScrypt: "' +
    line +
    '"\n  rules: { approved: true }\n  (legacy: top-level approved: true still works)\n'
)

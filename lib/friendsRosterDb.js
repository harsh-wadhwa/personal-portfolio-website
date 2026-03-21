import { isUrlFriendlyFriendsUsername } from '@/data/friendsUsernames'
import { friendsDbError } from '@/lib/friendsDebugLog'
import { verifyFriendsPasswordScrypt } from '@/lib/friendsPasswordCrypto'
import { getDb } from '@/lib/mongodb'

const KNOW_ME_NOTE_MAX = 2000

/** New docs use rules.approved; legacy rows may still have top-level approved only. */
export function isFriendsRosterApproved(doc) {
  if (!doc || typeof doc !== 'object') return false
  if (doc.rules && typeof doc.rules === 'object' && Object.prototype.hasOwnProperty.call(doc.rules, 'approved')) {
    return doc.rules.approved === true
  }
  return doc.approved === true
}

export function getFriendsRosterCollectionName() {
  return (process.env.FRIENDS_ROSTER_COLLECTION || 'friends').trim()
}

/**
 * Approved roster usernames (lowercase in DB).
 * @returns {Promise<string[]>}
 */
export async function getFriendsUsernamesSorted() {
  try {
    const db = await getDb()
    if (!db) return []
    const col = db.collection(getFriendsRosterCollectionName())
    const approvedQuery = {
      $or: [
        { 'rules.approved': true },
        {
          approved: true,
          $or: [{ rules: { $exists: false } }, { 'rules.approved': { $exists: false } }],
        },
      ],
    }
    const docs = await col.find(approvedQuery, { projection: { _id: 0, username: 1 } }).toArray()
    const names = [...new Set(docs.map((d) => String(d.username || '').trim().toLowerCase()).filter(Boolean))]
    names.sort()
    return names
  } catch (e) {
    friendsDbError('getFriendsUsernamesSorted', e)
    return []
  }
}

/**
 * @returns {Promise<{ username?: string, passwordScrypt?: string, approved?: boolean } | null>}
 */
export async function findFriendsRosterByUsername(username) {
  const db = await getDb()
  if (!db) return null
  const u = String(username || '').trim().toLowerCase()
  if (!isUrlFriendlyFriendsUsername(u)) return null
  const col = db.collection(getFriendsRosterCollectionName())
  return col.findOne(
    { username: u },
    { projection: { _id: 0, username: 1, passwordScrypt: 1, approved: 1, rules: 1 } }
  )
}

export function verifyFriendsRosterPasswordAgainstDoc(doc, plainPassword) {
  if (!doc || typeof doc.passwordScrypt !== 'string' || !doc.passwordScrypt.trim()) return false
  return verifyFriendsPasswordScrypt(plainPassword, doc.passwordScrypt)
}

/** Any roster row with this username (pending or approved). */
export async function friendsRosterUsernameExists(username) {
  const db = await getDb()
  if (!db) return false
  const u = String(username || '').trim().toLowerCase()
  if (!isUrlFriendlyFriendsUsername(u)) return false
  const col = db.collection(getFriendsRosterCollectionName())
  const doc = await col.findOne({ username: u }, { projection: { _id: 1 } })
  return !!doc
}

/**
 * Pending signup: set `rules.approved: true` in Mongo after review (legacy: top-level `approved`).
 * @param {{
 *   username: string
 *   passwordScrypt: string
 *   signupInfo: {
 *     knowMeNote: string
 *     ip: string
 *     userAgent: string
 *     acceptLanguage: string
 *     forwardedFor: string
 *   }
 * }} row
 */
export async function insertFriendsRosterPendingSignup({ username, passwordScrypt, signupInfo }) {
  const db = await getDb()
  if (!db) throw new Error('MongoDB unavailable')
  const u = String(username || '').trim().toLowerCase()
  if (!isUrlFriendlyFriendsUsername(u)) throw new Error('Invalid username')
  const raw = signupInfo && typeof signupInfo === 'object' ? signupInfo : {}
  const note = String(raw.knowMeNote || '').trim().slice(0, KNOW_ME_NOTE_MAX)
  const col = db.collection(getFriendsRosterCollectionName())
  await col.insertOne({
    username: u,
    passwordScrypt,
    signupInfo: {
      knowMeNote: note,
      ip: String(raw.ip || '').trim().slice(0, 200),
      userAgent: String(raw.userAgent || '').trim().slice(0, 512),
      acceptLanguage: String(raw.acceptLanguage || '').trim().slice(0, 128),
      forwardedFor: String(raw.forwardedFor || '').trim().slice(0, 512),
    },
    rules: {
      approved: false,
    },
    createdAt: new Date(),
  })
}

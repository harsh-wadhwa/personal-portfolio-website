import { friendsDbError, friendsLog } from '@/lib/friendsDebugLog'
import { getFriendsTimezone, mondayOfWeekContaining } from '@/lib/friendsWeek'
import { DateTime } from 'luxon'
import { getDb } from '@/lib/mongodb'

/** Set `FRIENDS_MONGO_COLLECTION` in env if data lives outside the default collection. */
export function getFriendsActivityCollectionName() {
  const name = process.env.FRIENDS_MONGO_COLLECTION
  return (name && String(name).trim()) || 'friends_activity_entries'
}

/**
 * Inserts a full snapshot for a calendar day (latest `createdAt` wins in the UI).
 * @param {{ date: string, entries: object, source?: string, username: string }} row
 */
export async function insertFriendsActivityEntry({ date, entries, source = 'web', username }) {
  const db = await getDb()
  if (!db) throw new Error('MongoDB unavailable')

  const tz = getFriendsTimezone()
  const d = DateTime.fromISO(date, { zone: tz }).startOf('day')
  const weekMonday = mondayOfWeekContaining(d).toISODate()

  await db.collection(getFriendsActivityCollectionName()).insertOne({
    date,
    weekMonday,
    username,
    entries,
    createdAt: new Date(),
    source,
  })
}

/**
 * Latest document per calendar day for a user in [mondayISO, sundayISO] (inclusive).
 * @returns {Promise<Record<string, { entries: object }>>}
 */
export async function getLatestEntriesByDate(mondayISO, sundayISO, username) {
  const db = await getDb()
  if (!db) {
    friendsLog('read:skip', { reason: 'no db', range: [mondayISO, sundayISO], username })
    return {}
  }

  const dbName = process.env.MONGODB_DB || 'portfolio'
  const col = db.collection(getFriendsActivityCollectionName())

  const baseFilter = {
    username,
    date: { $gte: mondayISO, $lte: sundayISO },
  }

  try {
    const rawCount = await col.countDocuments(baseFilter)

    const pipeline = [
      { $match: baseFilter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$date',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $project: { _id: 0, date: 1, entries: 1 } },
      { $sort: { date: 1 } },
    ]

    const rows = await col.aggregate(pipeline).toArray()
    /** @type {Record<string, { entries: object }>} */
    const map = {}
    for (const r of rows) {
      map[r.date] = { entries: r.entries || {} }
    }

    friendsLog('read:result', {
      db: dbName,
      collection: getFriendsActivityCollectionName(),
      rangeInclusive: [mondayISO, sundayISO],
      username,
      documentsInRange: rawCount,
      latestPerDayRows: rows.length,
      datesWithData: rows.map((r) => r.date),
    })

    return map
  } catch (err) {
    friendsDbError('getLatestEntriesByDate failed', err)
    return {}
  }
}

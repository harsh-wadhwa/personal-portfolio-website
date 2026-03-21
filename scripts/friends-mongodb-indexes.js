/**
 * Optional indexes for friends tracker reads.
 *
 *   npm run friends:indexes
 */
const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())

const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'portfolio'
const activityCol =
  (process.env.FRIENDS_MONGO_COLLECTION && String(process.env.FRIENDS_MONGO_COLLECTION).trim()) ||
  'friends_activity_entries'
const rosterCol =
  (process.env.FRIENDS_ROSTER_COLLECTION && String(process.env.FRIENDS_ROSTER_COLLECTION).trim()) ||
  'friends'

if (!uri) {
  console.error('Missing MONGODB_URI')
  process.exit(1)
}

;(async () => {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    await db.collection(activityCol).createIndex({ date: 1, createdAt: -1 })
    await db.collection(activityCol).createIndex({ weekMonday: 1 })
    await db.collection(activityCol).createIndex({ username: 1, date: 1, createdAt: -1 })
    await db.collection(rosterCol).createIndex({ username: 1 }, { unique: true })
    await db.collection(rosterCol).createIndex({ approved: 1, username: 1 })
    await db.collection(rosterCol).createIndex({ 'rules.approved': 1, username: 1 })
    console.log('Indexes ensured:', dbName, activityCol, rosterCol)
  } finally {
    await client.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

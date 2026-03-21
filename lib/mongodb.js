import { friendsDbError, friendsLog } from '@/lib/friendsDebugLog'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

/**
 * @returns {Promise<import('mongodb').Db | null>}
 */
export async function getDb() {
  if (!uri || !String(uri).trim()) {
    friendsLog('mongodb:getDb', {
      connected: false,
      reason: 'MONGODB_URI unset',
      dbName: process.env.MONGODB_DB || 'portfolio',
    })
    return null
  }

  const g = globalThis
  try {
    if (!g._mongoClientPromiseFriends) {
      const client = new MongoClient(uri, options)
      g._mongoClientPromiseFriends = client.connect()
    }
    const client = await g._mongoClientPromiseFriends
    return client.db(process.env.MONGODB_DB || 'portfolio')
  } catch (err) {
    friendsDbError('MongoDB getDb failed (invalid URI, network, or auth)', err)
    delete g._mongoClientPromiseFriends
    return null
  }
}

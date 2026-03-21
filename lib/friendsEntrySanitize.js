import { activityColumns, emptyEntries } from '@/data/friendsActivity'

/** @param {Record<string, unknown>} raw */
export function sanitizeEntriesPayload(raw) {
  const out = emptyEntries()
  if (!raw || typeof raw !== 'object') return out
  for (const col of activityColumns) {
    if (!(col.key in raw)) continue
    out[col.key] = coerceEntry(col.key, raw[col.key])
  }
  return out
}

function coerceEntry(key, val) {
  if (val === null || val === undefined) return null
  if (key === 'weightTraining') {
    if (val === true || val === false) return val
    const l = String(val).toLowerCase().trim()
    if (l === 'yes' || l === 'true' || l === '1') return true
    if (l === 'no' || l === 'false' || l === '0') return false
    return null
  }
  if (typeof val === 'number' && !Number.isNaN(val)) return val
  const s = String(val).trim()
  if (s === '' || s === '-') return null
  const n = Number(s)
  if (!Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(s)) return n
  return s
}

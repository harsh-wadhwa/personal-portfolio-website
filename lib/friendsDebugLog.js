/** Server-side only. Set FRIENDS_DEBUG=1 to log when NODE_ENV is production (e.g. `next start`). */
export function friendsLogEnabled() {
  return process.env.NODE_ENV === 'development' || process.env.FRIENDS_DEBUG === '1'
}

export function friendsLog(label, payload) {
  if (!friendsLogEnabled()) return
  const line =
    typeof payload === 'object' && payload !== null
      ? JSON.stringify({ ...payload, _tag: label })
      : JSON.stringify({ _tag: label, msg: payload })
  console.log('[friends]', line)
}

export function friendsDbError(message, err) {
  console.error('[friends-db]', message, err?.message || err)
}

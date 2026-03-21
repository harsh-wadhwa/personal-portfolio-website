import { DateTime } from 'luxon'

export function getFriendsTimezone() {
  const tz = process.env.FRIENDS_TIMEZONE || 'UTC'
  return DateTime.now().setZone(tz).isValid ? tz : 'UTC'
}

/** Monday 00:00 in tracker TZ for the calendar week containing `dt`. */
export function mondayOfWeekContaining(dt) {
  const d = dt.startOf('day')
  const wd = d.weekday
  return d.minus({ days: wd - 1 })
}

/**
 * Resolve viewed week from query.
 * - `week` = any YYYY-MM-DD in that week (normalized to Monday in TZ)
 * - `o` = integer week offset from current week (0 = this week)
 */
export function resolveWeekMondayFromQuery(query, now = DateTime.now()) {
  const tz = getFriendsTimezone()
  const z = now.setZone(tz)

  if (query.week && /^\d{4}-\d{2}-\d{2}$/.test(String(query.week))) {
    const d = DateTime.fromISO(String(query.week), { zone: tz }).startOf('day')
    if (!d.isValid) return mondayOfWeekContaining(z)
    return mondayOfWeekContaining(d)
  }

  if (query.o !== undefined && query.o !== '') {
    const offset = parseInt(String(query.o), 10)
    if (!Number.isNaN(offset)) {
      const currentMonday = mondayOfWeekContaining(z)
      return currentMonday.plus({ weeks: offset })
    }
  }

  return mondayOfWeekContaining(z)
}

/** @returns {{ mondayISO: string, sundayISO: string, days: { date: string, label: string }[] }} */
export function weekRangeFromMonday(monday) {
  const mon = monday.startOf('day')
  const sun = mon.plus({ days: 6 }).startOf('day')
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = mon.plus({ days: i })
    days.push({
      date: d.toISODate(),
      label: d.toFormat('ccc, d LLL'),
    })
  }
  return {
    mondayISO: mon.toISODate(),
    sundayISO: sun.toISODate(),
    days,
  }
}

export function shiftWeekMonday(monday, deltaWeeks) {
  return monday.plus({ weeks: deltaWeeks })
}

/** Today's calendar date in tracker timezone (YYYY-MM-DD). */
export function defaultLogDateISO(now = DateTime.now()) {
  return now.setZone(getFriendsTimezone()).toISODate()
}

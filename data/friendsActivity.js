/**
 * Friends tracker column config. Week rows are built at runtime (Mon–Sun) and merged with MongoDB.
 */
export const activityColumns = [
  { key: 'steps', label: 'Steps' },
  { key: 'water', label: 'Water intake' },
  { key: 'weightTraining', label: 'Weight training' },
  { key: 'fiveKmsTiming', label: '5kms timing' },
  { key: 'caloriesKcal', label: 'Calories (kcal)' },
  { key: 'protein', label: 'Protein' },
  { key: 'bodyWeight', label: 'Body weight' },
  { key: 'measurements', label: 'Measurements' },
]

/** @typedef {Record<string, number | boolean | string | null | undefined>} ActivityEntries */

export function emptyEntries() {
  /** @type {ActivityEntries} */
  const e = {}
  for (const col of activityColumns) {
    e[col.key] = null
  }
  return e
}

/**
 * @param {{ date: string, label: string }[]} dayMetas
 * @param {Record<string, { entries?: ActivityEntries }>} latestByDate
 */
export function mergeWeekRows(dayMetas, latestByDate) {
  const blank = emptyEntries()
  return dayMetas.map(({ date, label }) => ({
    date,
    label,
    entries: { ...blank, ...(latestByDate[date]?.entries || {}) },
  }))
}

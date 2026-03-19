/**
 * Activity tracker for /friends — static for now; replace with API/Mongo fetch later.
 *
 * To add a column: append to `activityColumns`, then set values per day under `entries[columnKey]`.
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

/** Defaults for optional metrics — all null until filled (e.g. from DB). */
const nullMetricDefaults = {
  fiveKmsTiming: null,
  caloriesKcal: null,
  protein: null,
  bodyWeight: null,
  measurements: null,
}

/** @type {{ date: string; label: string; entries: ActivityEntries }[]} */
export const friendsActivityWeek = [
  { date: '2026-03-16', label: 'Mon, 16 Mar', entries: { ...nullMetricDefaults } },
  { date: '2026-03-17', label: 'Tue, 17 Mar', entries: { ...nullMetricDefaults } },
  { date: '2026-03-18', label: 'Wed, 18 Mar', entries: { ...nullMetricDefaults } },
  {
    date: '2026-03-19',
    label: 'Thu, 19 Mar',
    entries: {
      ...nullMetricDefaults,
      steps: 7234,
      water: null,
      weightTraining: true,
    },
  },
  { date: '2026-03-20', label: 'Fri, 20 Mar', entries: { ...nullMetricDefaults } },
  { date: '2026-03-21', label: 'Sat, 21 Mar', entries: { ...nullMetricDefaults } },
  { date: '2026-03-22', label: 'Sun, 22 Mar', entries: { ...nullMetricDefaults } },
]

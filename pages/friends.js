import dynamic from 'next/dynamic'
import siteMetadata from '@/data/siteMetadata'
import { activityColumns, friendsActivityWeek } from '@/data/friendsActivity'
import { PageSEO } from '@/components/SEO'

const FriendsMetricCharts = dynamic(() => import('@/components/FriendsMetricCharts'), {
  ssr: false,
  loading: () => (
    <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">Loading charts…</p>
  ),
})

function formatCell(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}

export default function Friends() {
  return (
    <>
      <PageSEO
        title={`Friends — activity tracker - ${siteMetadata.author}`}
        description="Weekly activity tracker (steps, water, training, and more)."
      />
      <div className="space-y-2 pt-6 pb-4 md:space-y-5">
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-zinc-800 dark:text-white md:text-5xl">
          Tracking
        </h1>
      </div>

      <FriendsMetricCharts rows={friendsActivityWeek} />

      <div className="pb-12 pt-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:shadow-none">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/80">
                <th
                  scope="col"
                  className="sticky left-0 z-10 whitespace-nowrap border-b border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-gray-900 dark:border-gray-700 dark:bg-zinc-800 dark:text-gray-100"
                >
                  Date
                </th>
                {activityColumns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-zinc-900">
              {friendsActivityWeek.map((row) => (
                <tr
                  key={row.date}
                  className="transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/40"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 whitespace-nowrap border-gray-200 bg-white px-4 py-3 font-medium text-gray-900 dark:border-gray-700 dark:bg-zinc-900 dark:text-gray-100"
                  >
                    <time dateTime={row.date}>{row.label}</time>
                  </th>
                  {activityColumns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300"
                    >
                      {formatCell(row.entries[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
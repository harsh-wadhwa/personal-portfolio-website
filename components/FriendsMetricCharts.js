import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function buildChartData(rows) {
  return rows.map((row) => ({
    name: row.label.split(',')[0].trim(),
    steps: typeof row.entries.steps === 'number' ? row.entries.steps : null,
    caloriesKcal: typeof row.entries.caloriesKcal === 'number' ? row.entries.caloriesKcal : null,
    protein: typeof row.entries.protein === 'number' ? row.entries.protein : null,
  }))
}

function MetricChart({ title, subtitle, data, dataKey, color, formatValue, tick, grid, tooltipStyle, dotFill }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-zinc-900 dark:shadow-none">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      <div className="mt-3 h-[220px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="name" tick={tick} axisLine={{ stroke: grid }} tickLine={{ stroke: grid }} />
            <YAxis
              tick={tick}
              axisLine={{ stroke: grid }}
              tickLine={{ stroke: grid }}
              width={40}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => (value == null ? '—' : formatValue(value))}
              labelFormatter={(label) => label}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={title}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: dotFill }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function FriendsMetricCharts({ rows }) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const dark = mounted && resolvedTheme === 'dark'
  const tick = { fill: dark ? '#a1a1aa' : '#52525b', fontSize: 11 }
  const grid = dark ? 'rgba(161,161,170,0.2)' : 'rgba(82,82,91,0.15)'
  const tooltipStyle = {
    borderRadius: '0.5rem',
    border: dark ? '1px solid rgb(63 63 70)' : '1px solid rgb(228 228 231)',
    backgroundColor: dark ? 'rgb(24 24 27)' : 'rgb(255 255 255)',
    color: dark ? '#f4f4f5' : '#18181b',
    fontSize: '12px',
  }
  const dotFill = dark ? '#18181b' : '#ffffff'

  const data = buildChartData(rows)

  return (
    <section className="mb-10" aria-label="Weekly metrics charts">
      <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-white">Trends</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        <MetricChart
          title="Steps"
          subtitle="Daily step count"
          data={data}
          dataKey="steps"
          color="#059669"
          formatValue={(v) => Number(v).toLocaleString()}
          tick={tick}
          grid={grid}
          tooltipStyle={tooltipStyle}
          dotFill={dotFill}
        />
        <MetricChart
          title="Calories"
          subtitle="Energy (kcal)"
          data={data}
          dataKey="caloriesKcal"
          color="#d97706"
          formatValue={(v) => `${Number(v).toLocaleString()} kcal`}
          tick={tick}
          grid={grid}
          tooltipStyle={tooltipStyle}
          dotFill={dotFill}
        />
        <MetricChart
          title="Protein"
          subtitle="Daily total (g)"
          data={data}
          dataKey="protein"
          color="#7c3aed"
          formatValue={(v) => `${Number(v).toLocaleString()} g`}
          tick={tick}
          grid={grid}
          tooltipStyle={tooltipStyle}
          dotFill={dotFill}
        />
      </div>
    </section>
  )
}

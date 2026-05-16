import { useAnalytics } from '../hooks/useAnalytics'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  isAdmin: boolean
}

export default function AnalyticsDashboard({ isAdmin }: Props) {
  const { analytics, loading, error, refetch } = useAnalytics(isAdmin)

  if (!isAdmin) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 text-5xl">📊</div>
          <p className="text-lg text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
        <span>Error: {error}</span>
        <button
          type="button"
          onClick={() => void refetch()}
          className="ml-4 text-sm font-medium text-red-600 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="mb-1 flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <h2 className="text-xl font-bold">Admin Analytics</h2>
            <p className="text-sm text-blue-200">
              Platform-wide overview — visible only to admins
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-md">
          <div className="mb-3 text-3xl">👥</div>
          <div className="text-2xl font-bold text-gray-800">
            {analytics.totalUsers}
          </div>
          <div className="mt-1 text-sm text-gray-500">Total Users</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-md">
          <div className="mb-3 text-3xl">💰</div>
          <div className="text-2xl font-bold text-gray-800">
            ${analytics.totalSpending.toFixed(2)}
          </div>
          <div className="mt-1 text-sm text-gray-500">Platform Spending</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-md">
          <div className="mb-3 text-3xl">📊</div>
          <div className="text-2xl font-bold text-gray-800">
            ${analytics.averageSpendPerUser.toFixed(2)}
          </div>
          <div className="mt-1 text-sm text-gray-500">Avg per User</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-md">
          <div className="mb-3 text-3xl">⚡</div>
          <div className="text-2xl font-bold text-gray-800">
            {analytics.recentActivity}
          </div>
          <div className="mt-1 text-sm text-gray-500">Expenses This Week</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-700">
          Spending by Category — All Users
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={analytics.categoryBreakdown}>
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value: string) =>
                value.charAt(0).toUpperCase() + value.slice(1)
              }
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value: number) => `$${value}`}
            />
            <Tooltip
              formatter={(value) => {
                const amount =
                  typeof value === 'number' ? value : Number(value ?? 0)
                return [`$${amount.toFixed(2)}`, 'Total Spent']
              }}
              labelFormatter={(label) => {
                const text = String(label ?? '')
                return text.charAt(0).toUpperCase() + text.slice(1)
              }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {analytics.categoryBreakdown.map((entry) => {
                const colors: Record<string, string> = {
                  food: '#2563EB',
                  entertainment: '#059669',
                  transport: '#EA580C',
                  education: '#DC2626',
                  shopping: '#7C3AED',
                  other: '#6B7280',
                }
                return (
                  <Cell
                    key={entry.category}
                    fill={colors[entry.category] ?? '#6B7280'}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-700">
          Category Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>
                <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Spent
                </th>
                <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Expenses
                </th>
                <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Avg Each
                </th>
                <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.categoryBreakdown.map((row) => (
                <tr
                  key={row.category}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-2 py-3 font-medium capitalize text-gray-800">
                    {row.category}
                  </td>
                  <td className="px-2 py-3 text-right font-semibold text-gray-700">
                    ${row.total.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-right text-gray-500">
                    {row.count}
                  </td>
                  <td className="px-2 py-3 text-right text-gray-500">
                    ${(row.total / row.count).toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {row.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void refetch()}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
        >
          🔄 Refresh analytics
        </button>
      </div>
    </div>
  )
}

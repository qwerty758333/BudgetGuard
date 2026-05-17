import { useMemo, useState } from 'react'
import { AnalyticsTracker } from '../utils/analyticsTracker'
import { StatCard } from './StatCard'
import { BADGES } from '../utils/badges'
import type { Expense } from '../types'

interface PrivateAnalyticsDashboardProps {
  userId: string
  expenses: Expense[]
  earnedBadges: string[]
  onClose: () => void
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function PrivateAnalyticsDashboard({
  userId,
  expenses,
  earnedBadges,
  onClose,
}: PrivateAnalyticsDashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const analyticsTracker = useMemo(() => {
    void refreshKey
    const instance = new AnalyticsTracker(userId)
    return instance
  }, [userId, refreshKey])

  const stats = analyticsTracker.getStats()
  const mostCommonType =
    Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(analyticsTracker.getEvents(), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `budgetguard-analytics-${userId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    if (!window.confirm('Clear your local analytics history?')) return
    analyticsTracker.clearEvents()
    setRefreshKey((key) => key + 1)
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Your Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Private activity stored on this device
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Close
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="📊" label="Total Events" value={stats.totalEvents} />
        <StatCard icon="🏆" label="Badges Earned" value={`${earnedBadges.length}/${BADGES.length}`} />
        <StatCard icon="💰" label="Your Expenses" value={expenses.length} />
        <StatCard icon="⚡" label="Events / Hour" value={stats.eventsPerHour} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
          <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Event types
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {Object.keys(stats.byType).length === 0 ? (
              <li>No events tracked yet.</li>
            ) : (
              Object.entries(stats.byType).map(([type, count]) => (
                <li key={type} className="flex justify-between gap-2">
                  <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))
            )}
          </ul>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Most common: <span className="font-medium">{mostCommonType}</span>
          </p>
        </article>

        <article className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
          <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Recent events
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {stats.recentEvents.length === 0 ? (
              <li>No recent activity.</li>
            ) : (
              stats.recentEvents.map((event) => (
                <li key={event.timestamp} className="flex justify-between gap-2">
                  <span className="capitalize">{event.type.replace(/_/g, ' ')}</span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {formatTimeAgo(event.timestamp)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </article>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          Clear history
        </button>
      </div>
    </section>
  )
}

export default PrivateAnalyticsDashboard

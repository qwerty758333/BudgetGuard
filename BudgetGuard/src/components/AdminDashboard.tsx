import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../hooks/useAuth'
import {
  checkAdminAccess,
  clearAnalyticsOlderThan,
  fetchAdminAnalytics,
  type AdminAnalytics,
  type AdminEventRow,
} from '../services/analyticsService'

const EVENT_TYPE_LABELS: Record<string, string> = {
  expense_added: 'Expense Added',
  badge_earned: 'Badge Earned',
  ai_used: 'AI Used',
  expense_deleted: 'Expense Deleted',
  dark_mode_toggled: 'Dark Mode Toggled',
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  expense_added: '#2563EB',
  badge_earned: '#059669',
  ai_used: '#8B5CF6',
  expense_deleted: '#DC2626',
  dark_mode_toggled: '#F59E0B',
}

const CLEAR_OLD_DATA_DAYS = 30
const AUTO_REFRESH_MS = 30_000

function formatEventType(type: string): string {
  return EVENT_TYPE_LABELS[type] ?? type
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-LK', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMinutesAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 minute ago'
  return `${minutes} minutes ago`
}

function summarizeEventData(event: AdminEventRow): string {
  const data = event.event_data
  const parts: string[] = []

  if (typeof data.amount === 'number') {
    parts.push(`amount: ${data.amount}`)
  }
  if (typeof data.category === 'string') {
    parts.push(`category: ${data.category}`)
  }
  if (typeof data.badgeName === 'string') {
    parts.push(`badge: ${data.badgeName}`)
  }
  if (typeof data.description === 'string' && data.description) {
    parts.push(String(data.description).slice(0, 40))
  }
  if (typeof data.enabled === 'boolean') {
    parts.push(`enabled: ${data.enabled}`)
  }

  if (parts.length === 0) {
    return JSON.stringify(data).slice(0, 60)
  }

  return parts.join(' · ')
}

function exportEventsToCsv(events: AdminEventRow[]): void {
  const headers = ['id', 'event_type', 'user_id', 'created_at', 'event_data']
  const rows = events.map((event) => [
    event.id,
    event.event_type,
    event.user_id,
    event.created_at,
    JSON.stringify(event.event_data).replace(/"/g, '""'),
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `budgetguard-analytics-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function MetricCard({
  title,
  icon,
  children,
  className = '',
}: {
  title: string
  icon: string
  children: ReactNode
  className?: string
}) {
  return (
    <article
      className={`rounded-xl bg-white p-5 shadow-md dark:bg-gray-800 dark:shadow-lg ${className}`}
    >
      <header className="mb-4 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </header>
      {children}
    </article>
  )
}

export function AdminDashboard() {
  const { session, loading: authLoading } = useAuth()
  const [accessState, setAccessState] = useState<
    'checking' | 'denied' | 'not-admin' | 'granted'
  >('checking')
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const verifyAccess = useCallback(async () => {
    const access = await checkAdminAccess()
    if (access.error && !access.authenticated) {
      setError(access.error)
      setAccessState('denied')
      return
    }
    if (!access.authenticated) {
      setAccessState('denied')
      return
    }
    if (!access.isAdmin) {
      setAccessState('not-admin')
      return
    }
    setAccessState('granted')
  }, [])

  const loadAnalytics = useCallback(async () => {
    if (accessState !== 'granted') return

    setLoading(true)
    setError(null)
    setActionMessage(null)

    const result = await fetchAdminAnalytics()
    setLoading(false)

    if (result.success === false) {
      setError(result.error)
      return
    }

    setData(result.data)
    setLastUpdated(new Date())
  }, [accessState])

  useEffect(() => {
    if (authLoading) return
    void verifyAccess()
  }, [authLoading, session, verifyAccess])

  useEffect(() => {
    if (accessState === 'granted') {
      void loadAnalytics()
    }
  }, [accessState, loadAnalytics])

  useEffect(() => {
    if (accessState !== 'granted') return

    const interval = window.setInterval(() => {
      void loadAnalytics()
    }, AUTO_REFRESH_MS)

    return () => window.clearInterval(interval)
  }, [accessState, loadAnalytics])

  const eventsByTypeChart = useMemo(() => {
    if (!data) return []
    return Object.entries(data.byType).map(([type, count]) => ({
      type,
      label: formatEventType(type),
      count,
      fill: EVENT_TYPE_COLORS[type] ?? '#6B7280',
    }))
  }, [data])

  const handleExportCsv = () => {
    if (!data?.allEvents.length) {
      setActionMessage('No events to export.')
      return
    }
    exportEventsToCsv(data.allEvents)
    setActionMessage('CSV download started.')
  }

  const handleClearOldData = async () => {
    const confirmed = window.confirm(
      `Delete all analytics events older than ${CLEAR_OLD_DATA_DAYS} days? This cannot be undone.`,
    )
    if (!confirmed) return

    setLoading(true)
    const result = await clearAnalyticsOlderThan(CLEAR_OLD_DATA_DAYS)
    setLoading(false)

    if (result.success === false) {
      setError(result.error)
      return
    }

    setActionMessage(`Removed ${result.deletedCount} old event(s).`)
    await loadAnalytics()
  }

  if (authLoading || accessState === 'checking') {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Checking access...</p>
      </div>
    )
  }

  if (accessState === 'denied') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          You must be logged in
        </p>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          Sign in with an admin account to view analytics.
        </p>
      </div>
    )
  }

  if (accessState === 'not-admin') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-lg font-semibold text-red-900 dark:text-red-100">
          Admin access required
        </p>
        <p className="mt-2 text-sm text-red-800 dark:text-red-200">
          Your account does not have permission to view this dashboard.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Admin Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Real-time metrics from Supabase events
            {lastUpdated ? (
              <>
                {' '}
                · Last updated: {formatMinutesAgo(lastUpdated)} (
                {lastUpdated.toLocaleTimeString('en-LK')})
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loading || !data?.allEvents.length}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => void handleClearOldData()}
            disabled={loading}
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
          >
            Clear Old Data
          </button>
        </div>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
        >
          {error}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200">
          {actionMessage}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl bg-white shadow-md dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard title="Total Events" icon="📊" className="md:col-span-1">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {data.totalEvents.toLocaleString('en-LK')}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                All recorded events in the database
              </p>
            </MetricCard>

            <MetricCard title="Usage Statistics" icon="📈" className="md:col-span-1">
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>
                  <span className="font-medium">Most common:</span>{' '}
                  {formatEventType(data.mostCommonEventType)}
                </li>
                <li>
                  <span className="font-medium">Unique users:</span>{' '}
                  {data.uniqueUserCount}
                </li>
                <li>
                  <span className="font-medium">Events today (total):</span>{' '}
                  {data.eventsPerHourToday.reduce((sum, row) => sum + row.count, 0)}
                </li>
              </ul>
            </MetricCard>

            <MetricCard title="Recent Events" icon="⏱️" className="md:col-span-1">
              {data.recentEvents.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No events yet.</p>
              ) : (
                <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                  {data.recentEvents.map((event) => (
                    <li
                      key={event.id}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50"
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        [{formatEventType(event.event_type)}] —{' '}
                        {formatDateTime(event.created_at)}
                      </p>
                      <p className="mt-0.5 truncate text-gray-600 dark:text-gray-400">
                        {summarizeEventData(event)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </MetricCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MetricCard title="Events by Type" icon="📊">
              {eventsByTypeChart.every((row) => row.count === 0) ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No events recorded.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={eventsByTypeChart} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {eventsByTypeChart.map((entry) => (
                        <Cell key={entry.type} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {eventsByTypeChart.map((row) => (
                  <li
                    key={row.type}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900/50"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{row.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </MetricCard>

            <MetricCard title="Events per Hour (Today)" icon="📈">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.eventsPerHourToday}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </MetricCard>
          </div>

          <MetricCard title="Activity Trend (Last 24 Hours)" icon="📈">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.timeSeries24h}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </MetricCard>
        </>
      ) : null}

      {!loading && data && data.totalEvents === 0 ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          No analytics events yet. Activity will appear here as users interact with the app.
        </p>
      ) : null}
    </section>
  )
}

export default AdminDashboard

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { loadExpensesForUser } from '../utils/expenseStore'

export interface AnalyticsData {
  totalUsers: number
  totalExpenses: number
  totalSpending: number
  averageSpendPerUser: number
  categoryBreakdown: {
    category: string
    total: number
    count: number
    percentage: number
  }[]
  recentActivity: number
}

export function useAnalytics(isAdmin: boolean) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(isAdmin)
  const [error, setError] = useState<string | null>(null)

  async function fetchAnalytics() {
    if (!isAdmin) return
    setLoading(true)
    setError(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const userId = session?.user?.id
      if (!userId) {
        throw new Error('Sign in to view analytics.')
      }

      const expenses = await loadExpensesForUser(userId)

      const totalUsers = 1
      const totalExpenses = expenses.length
      const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0)
      const averageSpendPerUser = totalSpending

      const categoryMap: Record<string, { total: number; count: number }> = {}
      expenses.forEach((e) => {
        const cat = e.category ?? 'other'
        if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 }
        categoryMap[cat].total += e.amount
        categoryMap[cat].count += 1
      })

      const categoryBreakdown = Object.entries(categoryMap)
        .map(([category, data]) => ({
          category,
          total: data.total,
          count: data.count,
          percentage:
            totalSpending > 0
              ? Math.round((data.total / totalSpending) * 100)
              : 0,
        }))
        .sort((a, b) => b.total - a.total)

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentActivity = expenses.filter((e) => {
        const raw = e.created_at || e.date
        return raw ? new Date(raw) > sevenDaysAgo : false
      }).length

      setAnalytics({
        totalUsers,
        totalExpenses,
        totalSpending,
        averageSpendPerUser,
        categoryBreakdown,
        recentActivity,
      })
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load analytics',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) void fetchAnalytics()
  }, [isAdmin])

  return { analytics, loading, error, refetch: fetchAnalytics }
}

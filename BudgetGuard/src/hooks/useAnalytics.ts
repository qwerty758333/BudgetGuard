import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, category, created_at')

      if (expensesError) throw expensesError

      const { data: users, error: usersError } = await supabase
        .from('admin_users')
        .select('id, role')

      if (usersError) throw usersError

      const totalUsers = users?.length ?? 0
      const totalExpenses = expenses?.length ?? 0
      const totalSpending =
        expenses?.reduce((sum, e) => sum + (e.amount ?? 0), 0) ?? 0
      const averageSpendPerUser =
        totalUsers > 0 ? totalSpending / totalUsers : 0

      const categoryMap: Record<string, { total: number; count: number }> = {}
      expenses?.forEach((e) => {
        const cat = e.category ?? 'other'
        if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 }
        categoryMap[cat].total += e.amount ?? 0
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
      const recentActivity =
        expenses?.filter((e) => new Date(e.created_at) > sevenDaysAgo).length ??
        0

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

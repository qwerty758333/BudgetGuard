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
      let expensesResult = await supabase
        .from('expenses')
        .select('amount, category, created_at')

      if (expensesResult.error) {
        expensesResult = await supabase
          .from('expenses')
          .select('amount, category, date')
      }

      if (expensesResult.error) throw expensesResult.error

      const expenses = expensesResult.data

      const { data: distinctUsers, error: distinctError } = await supabase
        .from('expenses')
        .select('user_id')

      if (distinctError) throw distinctError

      const totalUsers = new Set(
        (distinctUsers ?? []).map((row) => row.user_id),
      ).size
      const totalExpenses = expenses?.length ?? 0
      const totalSpending =
        expenses?.reduce((sum, e) => {
          const amount =
            typeof e.amount === 'string' ? Number(e.amount) : (e.amount ?? 0)
          return sum + amount
        }, 0) ?? 0
      const averageSpendPerUser =
        totalUsers > 0 ? totalSpending / totalUsers : 0

      const categoryMap: Record<string, { total: number; count: number }> = {}
      expenses?.forEach((e) => {
        const cat = e.category ?? 'other'
        if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 }
        const amount =
          typeof e.amount === 'string' ? Number(e.amount) : (e.amount ?? 0)
        categoryMap[cat].total += amount
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
        expenses?.filter((e) => {
          const createdAt =
            'created_at' in e && typeof e.created_at === 'string'
              ? e.created_at
              : null
          const expenseDate =
            'date' in e && typeof e.date === 'string' ? e.date : null
          const raw = createdAt ?? expenseDate
          return raw ? new Date(raw) > sevenDaysAgo : false
        }).length ?? 0

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

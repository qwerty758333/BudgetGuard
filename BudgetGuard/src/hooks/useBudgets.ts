import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_BUDGETS, getUserBudgets, saveUserBudgets } from '../utils/storage'

export type BudgetMap = Record<string, number>

/** Budget limits stored per user in localStorage (no Supabase `budgets` table). */
export function useBudgets(userId: string | undefined) {
  const [budgets, setBudgets] = useState<BudgetMap>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const stored = getUserBudgets(userId)
      const hasStored = Object.keys(stored).length > 0
      setBudgets(hasStored ? stored : { ...DEFAULT_BUDGETS })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load budget settings',
      )
      setBudgets({ ...DEFAULT_BUDGETS })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      void fetchBudgets()
    } else {
      setBudgets({})
      setLoading(false)
    }
  }, [userId, fetchBudgets])

  const setBudget = useCallback(
    async (category: string, amount: number) => {
      if (!userId) return

      setError(null)
      setBudgets((prev) => {
        const next = { ...prev, [category]: amount }
        saveUserBudgets(userId, next)
        return next
      })
    },
    [userId],
  )

  return { budgets, loading, error, setBudget, refetch: fetchBudgets }
}

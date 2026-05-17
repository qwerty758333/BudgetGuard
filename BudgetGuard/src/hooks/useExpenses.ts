import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '../types'
import {
  createLocalExpense,
  loadExpensesForUser,
  normalizeStoredExpense,
  saveExpensesForUser,
} from '../utils/expenseStore'

export type ExpenseMutationResult =
  | { success: true }
  | { success: false; error: string }

function mergeExpenses(existing: Expense[], incoming: Expense[]): Expense[] {
  const byId = new Map<string, Expense>()
  for (const row of incoming) {
    byId.set(row.id, normalizeStoredExpense(row))
  }
  for (const row of existing) {
    if (!byId.has(row.id)) {
      byId.set(row.id, normalizeStoredExpense(row))
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.created_at || b.date).getTime() -
      new Date(a.created_at || a.date).getTime(),
  )
}

/** Expenses are stored per user in localStorage (no Supabase `expenses` table). */
export function useExpenses(userId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!userId) {
      setExpenses([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await loadExpensesForUser(userId)
      setExpenses(rows)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not load saved expenses'
      setError(message)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void fetchExpenses()
  }, [fetchExpenses])

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<ExpenseMutationResult> => {
      if (!userId) {
        const message = 'You must be signed in to add expenses.'
        setError(message)
        return { success: false, error: message }
      }

      try {
        const row = createLocalExpense(userId, expense)
        setExpenses((prev) => {
          const next = mergeExpenses(prev, [row])
          saveExpensesForUser(userId, next)
          return next
        })
        setError(null)
        return { success: true }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not save expense'
        setError(message)
        return { success: false, error: message }
      }
    },
    [userId],
  )

  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId) return false

      try {
        setExpenses((prev) => {
          const next = prev.filter((e) => e.id !== id)
          saveExpensesForUser(userId, next)
          return next
        })
        setError(null)
        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not delete expense'
        setError(message)
        return false
      }
    },
    [userId],
  )

  return {
    expenses,
    loading,
    error,
    /** Always true — persistence is localStorage. */
    dbAvailable: true,
    addExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}

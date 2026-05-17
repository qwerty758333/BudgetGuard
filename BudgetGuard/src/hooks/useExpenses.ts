import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, Expense } from '../types'

export type ExpenseMutationResult =
  | { success: true }
  | { success: false; error: string }

/** PostgREST may return numeric columns as strings. */
function normalizeExpense(row: Expense): Expense {
  return {
    ...row,
    amount: typeof row.amount === 'string' ? Number(row.amount) : row.amount,
    date:
      typeof row.date === 'string' && row.date.includes('T')
        ? row.date.slice(0, 10)
        : row.date,
  }
}

function mergeExpenses(existing: Expense[], incoming: Expense[]): Expense[] {
  const byId = new Map<string, Expense>()
  for (const row of incoming) {
    byId.set(row.id, normalizeExpense(row))
  }
  for (const row of existing) {
    if (!byId.has(row.id)) {
      byId.set(row.id, normalizeExpense(row))
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

async function resolveActiveUserId(fallbackUserId?: string): Promise<string | null> {
  if (fallbackUserId) return fallbackUserId

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.user?.id ?? null
}

export function useExpenses(userId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    const activeUserId = await resolveActiveUserId(userId)
    if (!activeUserId) {
      setExpenses([])
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', activeUserId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setExpenses(((data ?? []) as Expense[]).map(normalizeExpense))
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setExpenses([])
      setLoading(false)
      return
    }

    void fetchExpenses()
  }, [userId, fetchExpenses])

  /** Reload list for the signed-in user (uses session id, not only hook prop). */
  const syncExpensesFromServer = useCallback(
    async (explicitUserId?: string): Promise<boolean> => {
      const activeUserId = await resolveActiveUserId(explicitUserId ?? userId)
      if (!activeUserId) return false

      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', activeUserId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return false
      }

      setExpenses(((data ?? []) as Expense[]).map(normalizeExpense))
      return true
    },
    [userId],
  )

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<ExpenseMutationResult> => {
      const activeUserId = await resolveActiveUserId(userId)
      if (!activeUserId) {
        const message = 'You must be signed in to add expenses.'
        setError(message)
        return { success: false, error: message }
      }

      const payload = {
        user_id: activeUserId,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        notes: expense.notes ?? null,
      }

      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert([payload])
        .select('*')

      if (!insertError && data && data.length > 0) {
        setExpenses((prev) => mergeExpenses(prev, data as Expense[]))
        return { success: true }
      }

      if (insertError) {
        // Retry without RETURNING when SELECT policies block `.select()` after insert.
        const { error: bareInsertError } = await supabase.from('expenses').insert([payload])

        if (bareInsertError) {
          setError(bareInsertError.message)
          return { success: false, error: bareInsertError.message }
        }
      }

      const synced = await syncExpensesFromServer(activeUserId)
      if (synced) {
        return { success: true }
      }

      // Insert succeeded; keep UI in sync even if refetch failed.
      const optimistic: Expense = {
        id: crypto.randomUUID(),
        user_id: activeUserId,
        amount: expense.amount,
        category: expense.category as Category,
        date: expense.date,
        notes: expense.notes ?? null,
        created_at: new Date().toISOString(),
      }
      setExpenses((prev) => mergeExpenses(prev, [optimistic]))
      return { success: true }
    },
    [userId, syncExpensesFromServer],
  )

  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      const activeUserId = await resolveActiveUserId(userId)
      if (!activeUserId) return false

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', activeUserId)

      if (deleteError) {
        setError(deleteError.message)
        return false
      }

      setExpenses((prev) => prev.filter((e) => e.id !== id))
      return true
    },
    [userId],
  )

  return {
    expenses,
    loading,
    error,
    addExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}

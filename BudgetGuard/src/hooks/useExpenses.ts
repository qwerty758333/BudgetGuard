import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
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

const DB_OK_KEY = 'budgetguard_expenses_db_ok'

function readDbAvailableFlag(): boolean {
  try {
    return sessionStorage.getItem(DB_OK_KEY) !== '0'
  } catch {
    return true
  }
}

function writeDbAvailableFlag(ok: boolean): void {
  try {
    sessionStorage.setItem(DB_OK_KEY, ok ? '1' : '0')
  } catch {
    // ignore
  }
}

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

async function resolveActiveUserId(fallbackUserId?: string): Promise<string | null> {
  if (fallbackUserId) return fallbackUserId

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.user?.id ?? null
}

/** Each attempt uses a fresh query builder (`.order()` mutates the builder). */
async function queryExpensesFromSupabase(activeUserId: string) {
  const filter = () =>
    supabase.from('expenses').select('*').eq('user_id', activeUserId)

  const byCreatedAt = await filter().order('created_at', { ascending: false })
  if (!byCreatedAt.error) return byCreatedAt

  const byDate = await filter().order('date', { ascending: false })
  if (!byDate.error) return byDate

  return filter()
}

export function useExpenses(userId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dbAvailable, setDbAvailable] = useState(readDbAvailableFlag)
  const skipRemoteRef = useRef(!readDbAvailableFlag())

  const markDbUnavailable = useCallback((message: string) => {
    skipRemoteRef.current = true
    setDbAvailable(false)
    writeDbAvailableFlag(false)
    setError(message)
  }, [])

  const markDbAvailable = useCallback(() => {
    skipRemoteRef.current = false
    setDbAvailable(true)
    writeDbAvailableFlag(true)
    setError(null)
  }, [])

  const persistLocal = useCallback(async (activeUserId: string, rows: Expense[]) => {
    const merged = mergeExpenses([], rows)
    setExpenses(merged)
    await saveExpensesForUser(activeUserId, merged)
  }, [])

  const fetchExpenses = useCallback(async () => {
    const activeUserId = await resolveActiveUserId(userId)
    if (!activeUserId) {
      setExpenses([])
      return
    }

    setLoading(true)
    setError(null)

    const local = await loadExpensesForUser(activeUserId)
    if (local.length > 0) {
      setExpenses(local)
    }

    if (skipRemoteRef.current) {
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await queryExpensesFromSupabase(activeUserId)

    if (fetchError) {
      markDbUnavailable(fetchError.message)
      if (local.length === 0) {
        setExpenses([])
      }
    } else {
      markDbAvailable()
      const remote = ((data ?? []) as Expense[]).map(normalizeStoredExpense)
      const merged = mergeExpenses(local, remote)
      setExpenses(merged)
      await saveExpensesForUser(activeUserId, merged)
    }

    setLoading(false)
  }, [userId, markDbAvailable, markDbUnavailable])

  useEffect(() => {
    if (!userId) {
      setExpenses([])
      setLoading(false)
      return
    }

    void fetchExpenses()
  }, [userId, fetchExpenses])

  const syncExpensesFromServer = useCallback(
    async (explicitUserId?: string): Promise<boolean> => {
      const activeUserId = await resolveActiveUserId(explicitUserId ?? userId)
      if (!activeUserId) return false

      if (skipRemoteRef.current) {
        const local = await loadExpensesForUser(activeUserId)
        setExpenses(local)
        return local.length > 0
      }

      const { data, error: fetchError } = await queryExpensesFromSupabase(activeUserId)

      if (fetchError) {
        markDbUnavailable(fetchError.message)
        const local = await loadExpensesForUser(activeUserId)
        setExpenses(local)
        return local.length > 0
      }

      markDbAvailable()
      const remote = ((data ?? []) as Expense[]).map(normalizeStoredExpense)
      await persistLocal(activeUserId, remote)
      return true
    },
    [userId, markDbAvailable, markDbUnavailable, persistLocal],
  )

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<ExpenseMutationResult> => {
      const activeUserId = await resolveActiveUserId(userId)
      if (!activeUserId) {
        const message = 'You must be signed in to add expenses.'
        setError(message)
        return { success: false, error: message }
      }

      const optimistic = createLocalExpense(activeUserId, expense)

      if (skipRemoteRef.current) {
        setExpenses((prev) => {
          const next = mergeExpenses(prev, [optimistic])
          void saveExpensesForUser(activeUserId, next)
          return next
        })
        return { success: true }
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
        setExpenses((prev) => {
          const next = mergeExpenses(prev, data as Expense[])
          void saveExpensesForUser(activeUserId, next)
          return next
        })
        return { success: true }
      }

      if (insertError) {
        const { error: bareInsertError } = await supabase.from('expenses').insert([payload])

        if (bareInsertError) {
          markDbUnavailable(bareInsertError.message)
          setExpenses((prev) => {
            const next = mergeExpenses(prev, [optimistic])
            void saveExpensesForUser(activeUserId, next)
            return next
          })
          return { success: true }
        }
      }

      const synced = await syncExpensesFromServer(activeUserId)
      if (synced) {
        return { success: true }
      }

      setExpenses((prev) => {
        const next = mergeExpenses(prev, [optimistic])
        void saveExpensesForUser(activeUserId, next)
        return next
      })
      return { success: true }
    },
    [userId, syncExpensesFromServer, markDbUnavailable],
  )

  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      const activeUserId = await resolveActiveUserId(userId)
      if (!activeUserId) return false

      if (!skipRemoteRef.current) {
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', activeUserId)

        if (deleteError) {
          markDbUnavailable(deleteError.message)
        }
      }

      setExpenses((prev) => {
        const next = prev.filter((e) => e.id !== id)
        void saveExpensesForUser(activeUserId, next)
        return next
      })
      return true
    },
    [userId, markDbUnavailable],
  )

  return {
    expenses,
    loading,
    error,
    dbAvailable,
    addExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Expense } from '../types'

export function useExpenses(userId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!userId) {
      setExpenses([])
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setExpenses((data ?? []) as Expense[])
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

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id' | 'created_at'>) => {
      if (!userId) return

      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: userId }])
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else if (data) {
        setExpenses((prev) => [data as Expense, ...prev])
      }
    },
    [userId],
  )

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!userId) return

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) {
        setError(deleteError.message)
      } else {
        setExpenses((prev) => prev.filter((e) => e.id !== id))
      }
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

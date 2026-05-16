import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface BudgetRow {
  id: string
  user_id: string
  category: string
  amount: number
  created_at: string
  updated_at: string
}

export type BudgetMap = Record<string, number>

export function useBudgets(userId: string | undefined) {
  const [budgets, setBudgets] = useState<BudgetMap>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchBudgets() {
    if (!userId) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      const map: BudgetMap = {}
      data?.forEach((row: BudgetRow) => {
        map[row.category] = row.amount
      })
      setBudgets(map)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (userId) {
      void fetchBudgets()
    } else {
      setBudgets({})
      setLoading(false)
    }
  }, [userId])

  async function setBudget(category: string, amount: number) {
    if (!userId) return

    setError(null)

    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category', category)
      .single()

    if (existing) {
      const { error: updateError } = await supabase
        .from('budgets')
        .update({ amount, updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (updateError) {
        setError(updateError.message)
      }
    } else {
      const { error: insertError } = await supabase
        .from('budgets')
        .insert([{ user_id: userId, category, amount }])

      if (insertError) {
        setError(insertError.message)
      }
    }

    setBudgets((prev) => ({ ...prev, [category]: amount }))
  }

  return { budgets, loading, error, setBudget, refetch: fetchBudgets }
}

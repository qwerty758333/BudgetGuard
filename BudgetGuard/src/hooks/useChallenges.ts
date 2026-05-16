import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Challenge {
  id: string
  user_id: string
  title: string
  category: string | null
  target_amount: number
  current_amount: number
  completed: boolean
  week_start: string
  created_at: string
}

export type NewChallenge = {
  title: string
  category?: string
  target_amount: number
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export function useChallenges(userId: string | undefined) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchChallenges() {
    if (!userId) return

    setLoading(true)
    setError(null)

    const weekStart = getWeekStart()

    const { data, error: fetchError } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setChallenges((data ?? []) as Challenge[])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (userId) {
      void fetchChallenges()
    } else {
      setChallenges([])
      setLoading(false)
    }
  }, [userId])

  async function addChallenge(newChallenge: NewChallenge) {
    if (!userId) return

    setError(null)

    const { data, error: insertError } = await supabase
      .from('challenges')
      .insert([
        {
          title: newChallenge.title,
          category: newChallenge.category ?? null,
          target_amount: newChallenge.target_amount,
          user_id: userId,
          current_amount: 0,
          completed: false,
          week_start: getWeekStart(),
        },
      ])
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
    } else if (data) {
      setChallenges((prev) => [...prev, data as Challenge])
    }
  }

  async function updateChallengeProgress(id: string, currentAmount: number) {
    if (!userId) return

    setError(null)

    const challenge = challenges.find((c) => c.id === id)
    const completed = challenge ? currentAmount >= challenge.target_amount : false

    const { error: updateError } = await supabase
      .from('challenges')
      .update({ current_amount: currentAmount, completed })
      .eq('id', id)
      .eq('user_id', userId)

    if (updateError) {
      setError(updateError.message)
    } else {
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, current_amount: currentAmount, completed } : c,
        ),
      )
    }
  }

  async function deleteChallenge(id: string) {
    if (!userId) return

    const { error: deleteError } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      setChallenges((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return {
    challenges,
    loading,
    error,
    addChallenge,
    updateChallengeProgress,
    deleteChallenge,
    refetch: fetchChallenges,
  }
}

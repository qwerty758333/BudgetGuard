// Supabase `badges` table requires a UNIQUE constraint on (user_id, badge_id) for upsert onConflict.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Badge {
  id: string
  user_id: string
  badge_id: string
  name: string
  emoji: string
  description: string
  unlocked: boolean
  unlocked_at: string | null
  created_at: string
}

const DEFAULT_BADGES = [
  {
    badge_id: 'budget_master',
    name: 'Budget Master',
    emoji: '🏆',
    description: 'Stay under your total budget for a week',
  },
  {
    badge_id: 'meal_prepper',
    name: 'Meal Prepper',
    emoji: '🍱',
    description: 'Keep food spending under $100',
  },
  {
    badge_id: 'minimalist',
    name: 'Minimalist',
    emoji: '🧘',
    description: 'Keep entertainment spending under $50',
  },
  {
    badge_id: 'early_bird',
    name: 'Early Bird',
    emoji: '🌅',
    description: 'Log an expense before 9am',
  },
  {
    badge_id: 'streak_3',
    name: 'On a Roll',
    emoji: '🔥',
    description: 'Log expenses 3 days in a row',
  },
] as const

export function useBadges(userId: string | undefined) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function initialiseBadges() {
    if (!userId) return

    const rows = DEFAULT_BADGES.map((b) => ({
      ...b,
      user_id: userId,
      unlocked: false,
      unlocked_at: null,
    }))

    const { error: upsertError } = await supabase
      .from('badges')
      .upsert(rows, { onConflict: 'user_id,badge_id' })

    if (upsertError) {
      setError(upsertError.message)
    }
  }

  async function fetchBadges() {
    if (!userId) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
    } else if (data && data.length === 0) {
      await initialiseBadges()
      await fetchBadges()
    } else {
      setBadges(data as Badge[])
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      void fetchBadges()
    } else {
      setBadges([])
      setLoading(false)
    }
  }, [userId])

  async function unlockBadge(badgeId: string) {
    if (!userId) return

    const now = new Date().toISOString()

    const { error: unlockError } = await supabase
      .from('badges')
      .update({ unlocked: true, unlocked_at: now })
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .eq('unlocked', false)

    if (unlockError) {
      setError(unlockError.message)
    } else {
      setBadges((prev) =>
        prev.map((b) =>
          b.badge_id === badgeId
            ? { ...b, unlocked: true, unlocked_at: now }
            : b,
        ),
      )
    }
  }

  return { badges, loading, error, unlockBadge, refetch: fetchBadges }
}

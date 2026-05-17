// Supabase `badges` table requires a UNIQUE constraint on (user_id, badge_id) for upsert onConflict.

import { useCallback, useEffect, useRef, useState } from 'react'
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
    emoji: '👑',
    description: 'Stay under total budget',
  },
  {
    badge_id: 'meal_prepper',
    name: 'Meal Prepper',
    emoji: '🍽️',
    description: 'Keep food spending under limit',
  },
  {
    badge_id: 'minimalist',
    name: 'Minimalist',
    emoji: '🎬',
    description: 'Entertainment under limit',
  },
  {
    badge_id: 'scholar',
    name: 'Scholar',
    emoji: '📚',
    description: 'Education under limit',
  },
  {
    badge_id: 'efficiency_expert',
    name: 'Efficiency Expert',
    emoji: '🚗',
    description: 'Transport under limit',
  },
] as const

export function useBadges(userId: string | undefined) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dbAvailable, setDbAvailable] = useState(true)
  const initAttemptedRef = useRef(false)

  const initialiseBadges = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

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
      setDbAvailable(false)
      return false
    }

    return true
  }, [userId])

  const fetchBadges = useCallback(async () => {
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
      setBadges([])
      setDbAvailable(false)
      setLoading(false)
      return
    }

    setDbAvailable(true)

    if (data && data.length > 0) {
      setBadges(data as Badge[])
      setLoading(false)
      return
    }

    if (!initAttemptedRef.current) {
      initAttemptedRef.current = true
      const created = await initialiseBadges()
      if (created) {
        const { data: retryData, error: retryError } = await supabase
          .from('badges')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })

        if (!retryError && retryData) {
          setBadges(retryData as Badge[])
        }
      }
    }

    setLoading(false)
  }, [userId, initialiseBadges])

  useEffect(() => {
    initAttemptedRef.current = false
    if (userId) {
      void fetchBadges()
    } else {
      setBadges([])
      setLoading(false)
      setDbAvailable(true)
    }
  }, [userId, fetchBadges])

  const unlockBadge = useCallback(
    async (badgeId: string) => {
      if (!userId || !dbAvailable) return

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
    },
    [userId, dbAvailable],
  )

  return { badges, loading, error, dbAvailable, unlockBadge, refetch: fetchBadges }
}

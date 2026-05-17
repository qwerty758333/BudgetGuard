// Supabase `badges` table requires a UNIQUE constraint on (user_id, badge_id) for upsert onConflict.

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, type Database } from '../lib/supabase'

type BadgeInsert = Database['public']['Tables']['badges']['Insert']

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

const DB_OK_KEY = 'budgetguard_badges_db_ok'

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

export function useBadges(userId: string | undefined) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dbAvailable, setDbAvailable] = useState(readDbAvailableFlag)
  const initAttemptedRef = useRef(false)
  const skipRemoteRef = useRef(!readDbAvailableFlag())

  const markDbUnavailable = useCallback((message: string) => {
    skipRemoteRef.current = true
    setDbAvailable(false)
    writeDbAvailableFlag(false)
    setError(message)
  }, [])

  const initialiseBadges = useCallback(async (): Promise<boolean> => {
    if (!userId || skipRemoteRef.current) return false

    const rows = DEFAULT_BADGES.map((b) => ({
      ...b,
      user_id: userId,
      unlocked: false,
      unlocked_at: null,
    }))

    for (const row of rows) {
      const { error: insertError } = await supabase
        .from('badges')
        .insert(row as BadgeInsert)

      if (
        insertError &&
        insertError.code !== '23505' &&
        !insertError.message.toLowerCase().includes('duplicate')
      ) {
        markDbUnavailable(insertError.message)
        return false
      }
    }

    return true
  }, [userId, markDbUnavailable])

  const fetchBadges = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    if (skipRemoteRef.current) {
      setBadges([])
      setLoading(false)
      return
    }

    const byCreatedAt = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    let fetchResult = byCreatedAt
    if (byCreatedAt.error) {
      fetchResult = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
    }

    const { data, error: fetchError } = fetchResult

    if (fetchError) {
      markDbUnavailable(fetchError.message)
      setBadges([])
      setLoading(false)
      return
    }

    setDbAvailable(true)
    writeDbAvailableFlag(true)
    skipRemoteRef.current = false

    if (data && data.length > 0) {
      setBadges(data as Badge[])
      setLoading(false)
      return
    }

    if (!initAttemptedRef.current) {
      initAttemptedRef.current = true
      const created = await initialiseBadges()
      if (created && !skipRemoteRef.current) {
        const { data: retryData, error: retryError } = await supabase
          .from('badges')
          .select('*')
          .eq('user_id', userId)

        if (!retryError && retryData) {
          setBadges(retryData as Badge[])
        }
      }
    }

    setLoading(false)
  }, [userId, initialiseBadges, markDbUnavailable])

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
      if (!userId || !dbAvailable || skipRemoteRef.current) return

      const now = new Date().toISOString()

      const { error: unlockError } = await supabase
        .from('badges')
        .update({ unlocked: true, unlocked_at: now })
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .eq('unlocked', false)

      if (unlockError) {
        markDbUnavailable(unlockError.message)
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
    [userId, dbAvailable, markDbUnavailable],
  )

  return { badges, loading, error, dbAvailable, unlockBadge, refetch: fetchBadges }
}

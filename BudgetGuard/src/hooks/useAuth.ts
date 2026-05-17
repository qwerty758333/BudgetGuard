import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { fetchAdminRoleFromDb } from '../utils/adminAccess'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'user' | 'admin' | null>(null)

  const applyRole = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setRole(null)
      return
    }

    const resolved = await fetchAdminRoleFromDb(authUser)
    setRole(resolved)
  }, [])

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return
      setSession(initialSession)
      if (initialSession?.user) {
        void applyRole(initialSession.user)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        void applyRole(nextSession.user)
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [applyRole])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const user: User | null = session?.user ?? null
  const isAdmin = role === 'admin'

  return {
    session,
    user,
    loading,
    logout,
    role,
    isAdmin,
  }
}

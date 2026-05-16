import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'user' | 'admin' | null>(null)

  async function fetchRole(userId: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching role:', error.message)
      setRole('user')
    } else {
      setRole(data.role as 'user' | 'admin')
    }
  }

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return
      setSession(initialSession)
      if (initialSession?.user?.id) {
        void fetchRole(initialSession.user.id)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user?.id) {
        void fetchRole(nextSession.user.id)
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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

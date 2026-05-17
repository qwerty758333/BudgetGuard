import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  logOut,
  onAuthStateChange,
  type AuthUser,
} from '../services/authService'
import { resolveIsAdminForAuthUser } from '../utils/adminAccess'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'user' | 'admin' | null>(null)

  const applyRole = useCallback(async (authUser: AuthUser | null) => {
    if (!authUser) {
      setRole(null)
      return
    }
    const resolved = await resolveIsAdminForAuthUser(authUser)
    setRole(resolved)
  }, [])

  useEffect(() => {
    let mounted = true

    void getCurrentUser().then((current) => {
      if (!mounted) return
      setUser(current)
      void applyRole(current)
      setLoading(false)
    })

    const unsubscribe = onAuthStateChange((nextUser) => {
      if (!mounted) return
      setUser(nextUser)
      void applyRole(nextUser)
      setLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [applyRole])

  const logout = useCallback(async () => {
    await logOut()
    setUser(null)
    setRole(null)
  }, [])

  const isAdmin = role === 'admin'

  return {
    session: user,
    user,
    loading,
    logout,
    role,
    isAdmin,
  }
}

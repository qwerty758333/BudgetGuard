import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../services/authService'
import { resolveIsAdminForAuthUser } from '../utils/adminAccess'

interface AdminOnlyRouteProps {
  children: ReactNode
}

/**
 * Renders children only for authenticated admin users.
 * Everyone else is sent back to the main dashboard.
 */
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    void getCurrentUser().then(async (user) => {
      if (!mounted) return
      if (!user) {
        setAllowed(false)
        return
      }
      const role = await resolveIsAdminForAuthUser(user)
      setAllowed(role === 'admin')
    })

    return () => {
      mounted = false
    }
  }, [])

  if (allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

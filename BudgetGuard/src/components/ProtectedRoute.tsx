import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, type AuthUser } from '../services/authService'

const LOADING_DELAY_MS = 150

export interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Renders children only when the user is authenticated.
 * Redirects to `/login` with a return path when not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadingTimer = window.setTimeout(() => {
      if (!cancelled && user === undefined) {
        setShowLoading(true)
      }
    }, LOADING_DELAY_MS)

    void getCurrentUser().then((currentUser) => {
      if (cancelled) return

      clearTimeout(loadingTimer)
      setShowLoading(false)
      setUser(currentUser)

      if (!currentUser) {
        const returnPath = location.pathname + location.search
        navigate('/login', {
          replace: true,
          state: { from: returnPath },
        })
      }
    })

    return () => {
      cancelled = true
      clearTimeout(loadingTimer)
    }
  }, [navigate, location.pathname, location.search])

  if (user === undefined) {
    if (!showLoading) {
      return null
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <span
            className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent"
            aria-hidden
          />
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute

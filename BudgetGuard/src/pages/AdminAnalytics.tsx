import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import AdminDashboard from '../components/AdminDashboard'
import {
  getAdminDeploymentDiagnostics,
  getAdminLoginErrorMessage,
  logAdminDeploymentDebug,
  resolveIsAdmin,
} from '../utils/adminAccess'

export function AdminAnalytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const refreshAccess = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      setIsAuthenticated(false)
      setIsAdmin(false)
      return
    }

    setIsAuthenticated(true)
    const admin = await resolveIsAdmin(session.user)
    setIsAdmin(admin)
    logAdminDeploymentDebug('AdminAnalytics', session.user)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
      setLoading(false)
      return
    }

    void refreshAccess().finally(() => setLoading(false))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshAccess()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshAccess])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail || !password) {
      setError('Email and password are required.')
      setSubmitting(false)
      return
    }

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (loginError) {
        if (import.meta.env.DEV) {
          console.error('[AdminAnalytics] signInWithPassword failed', loginError)
        }
        setError(getAdminLoginErrorMessage(loginError.message, loginError.status))
        setSubmitting(false)
        return
      }

      if (data.user) {
        setIsAuthenticated(true)
        const admin = await resolveIsAdmin(data.user)
        setIsAdmin(admin)
        logAdminDeploymentDebug('AdminAnalytics.login', data.user)
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[AdminAnalytics] login exception', err)
      }
      setError('Login failed. Check your connection and try again.')
    }

    setSubmitting(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setIsAdmin(false)
    setPassword('')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading admin portal...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Portal
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in with your Supabase Auth account (same as the main app).
          </p>

          <form onSubmit={(event) => void handleLogin(event)} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              autoComplete="email"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              autoComplete="current-password"
              required
            />

            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            No account yet?{' '}
            <a href="/" className="text-blue-600 hover:text-blue-800">
              Sign up on the main app
            </a>{' '}
            first, then return here.
          </p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    const deployment = getAdminDeploymentDiagnostics()
    const missingNetlifyEnv =
      !deployment.adminEmailConfigured && !deployment.adminUserIdsConfigured

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
        <div className="max-w-lg rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            You must be an admin to access this page. Your email must match{' '}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">VITE_ADMIN_EMAIL</code>,
            your user must exist in <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">admin_users</code>,
            or your account must have the admin role.
          </p>
          {missingNetlifyEnv ? (
            <div
              className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
              role="status"
            >
              <p className="font-semibold">Deployment configuration</p>
              <p className="mt-2">
                This build has no <code>VITE_ADMIN_EMAIL</code> or{' '}
                <code>VITE_ADMIN_USER_IDS</code> baked in. Vite only exposes env vars
                that exist at <strong>build time</strong> on Netlify.
              </p>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>Netlify → Site configuration → Environment variables</li>
                <li>
                  Add <code>VITE_ADMIN_EMAIL</code>,{' '}
                  <code>VITE_ADMIN_USER_IDS</code>, <code>VITE_SUPABASE_URL</code>,{' '}
                  <code>VITE_SUPABASE_ANON_KEY</code> (same values as local{' '}
                  <code>.env.local</code>)
                </li>
                <li>Deploys → Trigger deploy → Clear cache and deploy site</li>
              </ol>
              <p className="mt-2 text-xs opacity-90">
                Debug: open this page with <code>?admin_debug=1</code> and check the
                browser console (no secrets logged).
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Admin Analytics Dashboard
        </h1>
        <div className="flex flex-wrap gap-2">
          <a
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:text-blue-800 dark:border-gray-600 dark:bg-gray-800"
          >
            ← Back to App
          </a>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <AdminDashboard />
    </div>
  )
}

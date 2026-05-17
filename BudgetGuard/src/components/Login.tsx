import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DEMO_CREDENTIALS, logIn } from '../services/authService'
const REMEMBER_ME_KEY = 'budgetguard_remember_email'

const inputClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500'

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  )
}

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(REMEMBER_ME_KEY) ?? ''
  })
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === 'undefined') return false
    return Boolean(localStorage.getItem(REMEMBER_ME_KEY))
  })

  const fillDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Please enter both your email and password.')
      return
    }

    setIsLoading(true)

    const result = await logIn(trimmedEmail, password)

    setIsLoading(false)

    if (!result.success) {
      setError(
        result.error ??
          'Sign in failed. Check your credentials and try again.',
      )
      return
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, trimmedEmail.toLowerCase())
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY)
    }

    setEmail('')
    setPassword('')
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800 dark:shadow-gray-950/50">
        <p className="mb-2 text-center text-5xl" aria-hidden>
          🛡️
        </p>
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Sign in to your BudgetGuard account
        </p>

        <div
          className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100"
          role="note"
        >
          <p className="font-semibold">Demo credentials (judges)</p>
          <p className="mt-1">
            Email:{' '}
            <code className="rounded bg-white/60 px-1 dark:bg-gray-900/50">
              {DEMO_CREDENTIALS.email}
            </code>
          </p>
          <p>
            Password:{' '}
            <code className="rounded bg-white/60 px-1 dark:bg-gray-900/50">
              {DEMO_CREDENTIALS.password}
            </code>
          </p>
          <p className="mt-2 text-xs opacity-90">
            The demo account is created automatically on first login. You can also use Sign up
            with your own email.
          </p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="mt-3 text-xs font-medium text-[#2563EB] underline-offset-2 hover:underline dark:text-blue-400"
          >
            Auto-fill demo credentials
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              autoComplete="email"
              disabled={isLoading}
              className={inputClassName}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#2563EB] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] dark:border-gray-600 dark:bg-gray-700"
            />
            Remember me
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
            >
              <p className="font-medium">Could not sign in</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-xs opacity-90">
                Double-check your email and password, or reset your password if you forgot it.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden
              />
            )}
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-[#2563EB] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

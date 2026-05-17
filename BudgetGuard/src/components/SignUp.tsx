import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../services/authService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20'

const labelClassName = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'

type PasswordStrength = 'weak' | 'medium' | 'strong' | 'empty'

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'empty'
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 2) return 'weak'
  if (score <= 3) return 'medium'
  return 'strong'
}

function CheckIcon({ valid }: { valid: boolean }) {
  if (!valid) {
    return (
      <span className="text-gray-400 dark:text-gray-500" aria-hidden>
        ○
      </span>
    )
  }
  return (
    <span className="text-green-600 dark:text-green-400" aria-hidden>
      ✓
    </span>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  })

  const emailValid = EMAIL_PATTERN.test(email.trim())
  const usernameValid = username.trim().length >= 3
  const passwordValid = password.length >= 6
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const strengthLabel =
    passwordStrength === 'empty'
      ? ''
      : passwordStrength === 'weak'
        ? 'Weak'
        : passwordStrength === 'medium'
          ? 'Medium'
          : 'Strong'

  const strengthBarClass =
    passwordStrength === 'weak'
      ? 'w-1/3 bg-red-500'
      : passwordStrength === 'medium'
        ? 'w-2/3 bg-amber-500'
        : passwordStrength === 'strong'
          ? 'w-full bg-green-500'
          : 'w-0'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched({
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    })

    if (!emailValid) {
      setError('Please enter a valid email address.')
      return
    }
    if (!usernameValid) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!passwordValid) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await signUp(email, password, username)

    setIsLoading(false)

    if (result.success) {
      navigate('/dashboard')
      return
    }

    setError(result.error ?? 'Sign up failed. Please try again.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <p className="mb-2 text-center text-5xl" aria-hidden>
          🛡️
        </p>
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create your account
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Join BudgetGuard and start tracking your spending.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="signup-email" className={labelClassName}>
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="Enter your email"
              required
              autoComplete="email"
              aria-invalid={touched.email && !emailValid}
              aria-describedby={touched.email && !emailValid ? 'signup-email-error' : undefined}
              className={inputClassName}
            />
            {touched.email && (
              <p
                id="signup-email-error"
                className={`mt-1 flex items-center gap-1.5 text-xs ${
                  emailValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                <CheckIcon valid={emailValid} />
                {emailValid ? 'Valid email format' : 'Enter a valid email address'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="signup-username" className={labelClassName}>
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              placeholder="Choose a username"
              required
              minLength={3}
              autoComplete="username"
              aria-invalid={touched.username && !usernameValid}
              aria-describedby={
                touched.username && !usernameValid ? 'signup-username-error' : undefined
              }
              className={inputClassName}
            />
            {touched.username && (
              <p
                id="signup-username-error"
                className={`mt-1 flex items-center gap-1.5 text-xs ${
                  usernameValid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <CheckIcon valid={usernameValid} />
                {usernameValid ? 'Username looks good' : 'At least 3 characters required'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="signup-password" className={labelClassName}>
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Create password"
                required
                minLength={6}
                autoComplete="new-password"
                aria-invalid={touched.password && !passwordValid}
                aria-describedby="signup-password-hint"
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            <p id="signup-password-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              At least 6 characters. Use uppercase, numbers, and symbols for a stronger password.
            </p>
            {password.length > 0 && (
              <div className="mt-2" aria-live="polite">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Password strength</span>
                  <span
                    className={
                      passwordStrength === 'weak'
                        ? 'text-red-600'
                        : passwordStrength === 'medium'
                          ? 'text-amber-600'
                          : 'text-green-600'
                    }
                  >
                    {strengthLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthBarClass}`}
                  />
                </div>
              </div>
            )}
            {touched.password && (
              <p
                className={`mt-1 flex items-center gap-1.5 text-xs ${
                  passwordValid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <CheckIcon valid={passwordValid} />
                {passwordValid ? 'Password meets minimum length' : 'Minimum 6 characters'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className={labelClassName}>
              Confirm password
            </label>
            <div className="relative">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                placeholder="Confirm password"
                required
                autoComplete="new-password"
                aria-invalid={touched.confirmPassword && !passwordsMatch}
                aria-describedby={
                  touched.confirmPassword && !passwordsMatch
                    ? 'signup-confirm-password-error'
                    : undefined
                }
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
            {touched.confirmPassword && (
              <p
                id="signup-confirm-password-error"
                className={`mt-1 flex items-center gap-1.5 text-xs ${
                  passwordsMatch
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <CheckIcon valid={passwordsMatch} />
                {passwordsMatch ? 'Passwords match' : 'Passwords must match'}
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-800"
          >
            {isLoading && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden
              />
            )}
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-[#2563EB] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp

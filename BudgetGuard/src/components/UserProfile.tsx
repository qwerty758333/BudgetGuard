import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  getProfileForUser,
  logOut,
  updateUserProfile,
  type AuthUser,
} from '../services/authService'

const inputClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'

function formatMemberSince(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function SettingsIcon({ className }: { className?: string }) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function LogOutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function UserProfile() {
  const navigate = useNavigate()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [username, setUsername] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const user = await getCurrentUser()
    if (!user) {
      setAuthUser(null)
      setIsLoading(false)
      navigate('/login', { replace: true })
      return
    }

    const profileUsername = getProfileForUser(user.id, user.email)
    setAuthUser(user)
    setUsername(profileUsername)
    setEditUsername(profileUsername)
    setIsLoading(false)
  }, [navigate])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (!successMessage) return
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  const handleStartEdit = () => {
    setEditUsername(username)
    setIsEditing(true)
    setError(null)
    setSuccessMessage(null)
  }

  const handleCancelEdit = () => {
    setEditUsername(username)
    setIsEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!authUser) return

    const trimmed = editUsername.trim()
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    const result = await updateUserProfile(trimmed, authUser.email)

    setIsSaving(false)

    if (!result.success) {
      setError(result.error ?? 'Could not update profile. Please try again.')
      return
    }

    setUsername(trimmed)
    setEditUsername(trimmed)
    setIsEditing(false)
    setSuccessMessage('Profile updated successfully.')
    if (result.user) {
      setAuthUser(result.user)
    }
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to log out?')
    if (!confirmed) return

    setIsLoggingOut(true)
    setError(null)

    const result = await logOut()

    setIsLoggingOut(false)

    if (!result.success) {
      setError(result.error ?? 'Sign out failed. Please try again.')
      return
    }

    setAuthUser(null)
    setUsername('')
    setEditUsername('')
    navigate('/login', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center px-4">
        <div className="text-center">
          <div
            className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent"
            aria-hidden
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 sm:py-8">
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white dark:border-gray-700">
          <div>
            <div className="mb-2 flex items-center gap-2 text-blue-100">
              <SettingsIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Account settings</span>
            </div>
            <h1 className="text-2xl font-bold">Your profile</h1>
            <p className="mt-1 text-sm text-blue-100">Manage your BudgetGuard account</p>
          </div>
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-bold uppercase"
            aria-hidden
          >
            {username.slice(0, 2)}
          </div>
        </header>

        <div className="space-y-6 p-6">
          {successMessage && (
            <p
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300"
            >
              {successMessage}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}

          {isEditing ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSave()
              }}
            >
              <div>
                <label
                  htmlFor="profile-username"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Username
                </label>
                <input
                  id="profile-username"
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="john_doe"
                  required
                  minLength={3}
                  disabled={isSaving}
                  autoComplete="username"
                  className={inputClassName}
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </span>
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                  {authUser.email}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Email cannot be changed here.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      aria-hidden
                    />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </dt>
                <dd className="mt-1 text-base font-medium text-gray-900 dark:text-gray-100">
                  {authUser.email}
                </dd>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Username
                </dt>
                <dd className="mt-1 text-base font-medium text-gray-900 dark:text-gray-100">
                  {username}
                </dd>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Member since
                </dt>
                <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">
                  {formatMemberSince(authUser.created_at)}
                </dd>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Account status
                </dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
                    Active
                  </span>
                </dd>
              </div>
            </dl>
          )}

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex-row">
            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4" />
                Edit profile
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut || isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/50"
            >
              <LogOutIcon className="h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}

export default UserProfile

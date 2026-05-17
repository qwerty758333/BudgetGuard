import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { getCurrentUser, type AuthUser } from './services/authService'
import SignUp from './components/SignUp'
import Login from './components/Login'
import Landing from './components/Landing'
import ProtectedRoute from './components/ProtectedRoute'
import { AdminOnlyRoute } from './components/AdminOnlyRoute'
import UserProfile from './components/UserProfile'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import { BadgeGallery } from './components/BadgeGallery'
import { Celebration } from './components/Celebration'
import { AdminAnalytics } from './pages/AdminAnalytics'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { PrivateAnalyticsDashboard } from './components/PrivateAnalyticsDashboard'
import { ExpenseList } from './components/ExpenseList'
import { BudgetSettings } from './components/BudgetSettings'
import { useAuth } from './hooks/useAuth'
import { useExpenses, type ExpenseMutationResult } from './hooks/useExpenses'
import { useBudgets } from './hooks/useBudgets'
import { useBadges } from './hooks/useBadges'
import { useChallenges } from './hooks/useChallenges'
import type { Category } from './types'
import { trackEvent } from './services/analyticsService'
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  saveUserBadges,
  saveUserBudgets,
  saveUserExpenses,
} from './utils/storage'
import { checkBadges, getBadgeById } from './utils/badges'

export interface Budgets {
  [category: string]: number
}

const BADGE_ID_TO_SUPABASE: Record<string, string> = {
  'budget-master': 'budget_master',
  'meal-prepper': 'meal_prepper',
  minimalist: 'minimalist',
  scholar: 'scholar',
  'efficiency-expert': 'efficiency_expert',
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function BudgetGuardApp() {
  const { user, loading, logout, isAdmin } = useAuth()
  const {
    expenses,
    loading: expensesLoading,
    addExpense,
    deleteExpense,
  } = useExpenses(user?.id)

  const {
    budgets,
    loading: budgetsLoading,
    setBudget,
  } = useBudgets(user?.id)

  const {
    badges,
    loading: badgesLoading,
    dbAvailable: badgesDbAvailable,
    unlockBadge,
  } = useBadges(user?.id)

  const {
    challenges,
    loading: challengesLoading,
    addChallenge,
    updateChallengeProgress,
    deleteChallenge,
  } = useChallenges(user?.id)

  const [darkMode, setDarkMode] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard')
  const [celebrationBadgeName, setCelebrationBadgeName] = useState<string | null>(null)
  const prevEarnedBadgeIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!isAdmin && activeTab === 'analytics') {
      setActiveTab('dashboard')
    }
  }, [isAdmin, activeTab])

  const totalBudget = Object.values(budgets).reduce((sum, amount) => sum + amount, 0)
  const earnedBadges = checkBadges(
    expenses.map((e) => ({ amount: e.amount, category: e.category })),
    { total: totalBudget },
  )

  useEffect(() => {
    const newlyEarned = earnedBadges.filter(
      (id) => !prevEarnedBadgeIdsRef.current.includes(id),
    )

    if (newlyEarned.length > 0 && prevEarnedBadgeIdsRef.current.length > 0) {
      const badgeId = newlyEarned[0]
      const label = getBadgeById(badgeId)?.name ?? badgeId
      setCelebrationBadgeName(label)
    }

    prevEarnedBadgeIdsRef.current = earnedBadges
  }, [earnedBadges])

  useEffect(() => {
    if (!celebrationBadgeName) return

    const timer = window.setTimeout(() => {
      setCelebrationBadgeName(null)
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [celebrationBadgeName])

  useEffect(() => {
    const saved = loadFromLocalStorage()
    if (saved.darkMode) {
      setDarkMode(saved.darkMode)
    }
  }, [])

  useEffect(() => {
    saveToLocalStorage(darkMode)
  }, [darkMode])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (!user?.id) return
    saveUserExpenses(user.id, expenses)
  }, [user?.id, expenses])

  useEffect(() => {
    if (!user?.id) return
    saveUserBudgets(user.id, budgets)
  }, [user?.id, budgets])

  useEffect(() => {
    if (!user?.id) return
    saveUserBadges(user.id, earnedBadges)
  }, [user?.id, earnedBadges])

  // Sync earned badges to Supabase only when the badges table is available (avoids 400 spam).
  useEffect(() => {
    if (!user?.id || badgesLoading || !badgesDbAvailable || badges.length === 0) {
      return
    }

    earnedBadges.forEach((localId) => {
      const badgeId = BADGE_ID_TO_SUPABASE[localId]
      if (!badgeId) return

      const row = badges.find((b) => b.badge_id === badgeId)
      if (row && !row.unlocked) {
        void unlockBadge(badgeId)
      }
    })
  }, [earnedBadges, badges, badgesLoading, badgesDbAvailable, user?.id, unlockBadge])

  void challenges
  void challengesLoading
  void addChallenge
  void updateChallengeProgress
  void deleteChallenge
  void budgetsLoading

  const handleAddExpense = async (
    amount: number,
    category: string,
    date: string,
    notes: string,
  ) => {
    if (!user) {
      throw new Error('You must be signed in to add an expense.')
    }

    const result: ExpenseMutationResult = await addExpense({
      user_id: user.id,
      amount,
      category: category as Category,
      date,
      notes: notes || null,
    })

    if ('error' in result) {
      throw new Error(result.error)
    }

    await trackEvent(
      'expense_added',
      {
        amount,
        category,
        date,
        timestamp: new Date().toISOString(),
      },
      user.id,
    )
  }

  const handleSaveBudget = async (category: string, amount: number) => {
    await setBudget(category, amount)
  }

  if (false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="max-w-md rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm dark:border-amber-800 dark:bg-gray-800">
          <div className="mb-3 text-4xl">⚠️</div>
          <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            Configuration required
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Set <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">VITE_SUPABASE_URL</code>{' '}
            and{' '}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">VITE_SUPABASE_ANON_KEY</code>{' '}
            in your Netlify environment variables, then redeploy.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 text-5xl">🛡️</div>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Loading BudgetGuard...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/dashboard' }} />
  }

  const userId = user.id

  const handleDarkModeToggle = async () => {
    await trackEvent(
      'dark_mode_toggled',
      {
        enabled: !darkMode,
        timestamp: new Date().toISOString(),
      },
      userId,
    )
    setDarkMode(!darkMode)
  }

  const handleDeleteExpense = async (id: string) => {
    const expense = expenses.find((item) => item.id === id)
    if (expense) {
      await trackEvent(
        'expense_deleted',
        {
          expenseId: id,
          amount: expense.amount,
          category: expense.category,
          timestamp: new Date().toISOString(),
        },
        userId,
      )
    }
    await deleteExpense(id)
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <header className="flex items-center justify-between bg-blue-600 px-4 py-4 text-white shadow-md dark:bg-blue-900 sm:px-6">
          <h1 className="text-2xl font-bold sm:text-3xl">BudgetGuard</h1>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isAdmin && user?.email && (
              <span className="hidden text-sm text-blue-100 sm:inline">{user.email}</span>
            )}
            {isAdmin && (
              <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                Admin
              </span>
            )}
            <Link
              to="/profile"
              className="rounded-lg border border-white/30 bg-white/10 px-2 py-2 text-xs font-medium text-white transition hover:bg-white/20 sm:px-3 sm:text-sm"
            >
              Profile
            </Link>
            {isAdmin && (
              <Link
                to="/admin/analytics"
                className="rounded-lg border border-white/30 bg-white/10 px-2 py-2 text-xs font-medium text-white transition hover:bg-white/20 sm:px-3 sm:text-sm"
              >
                📊 <span className="hidden sm:inline">Admin Analytics</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-xl transition hover:bg-white/20"
              aria-label="Open budget settings"
            >
              ⚙️
            </button>
            <button
              type="button"
              onClick={() => void handleDarkModeToggle()}
              className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <>
                  <SunIcon />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <MoonIcon />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              Sign out
            </button>
          </div>
        </header>

        {isAdmin && (
          <nav className="container mx-auto flex max-w-4xl gap-2 px-4 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>👑</span>
              <span>Analytics</span>
            </button>
          </nav>
        )}

        <main className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
          {activeTab === 'dashboard' && (
            <>
              {celebrationBadgeName && (
                <Celebration show={true} badgeName={celebrationBadgeName} />
              )}
              <ExpenseForm userId={userId} onAddExpense={handleAddExpense} />
              <PrivateAnalyticsDashboard
                embedded
                userId={userId}
                expenses={expenses}
                earnedBadges={earnedBadges}
              />
              <Dashboard
                userEmail={user.email}
                expenses={expenses}
                budgets={budgets}
                expensesLoading={expensesLoading}
                onSetBudgetLimit={handleSaveBudget}
              />
              <ExpenseList
                userId={userId}
                expenses={expenses}
                onDeleteExpense={handleDeleteExpense}
              />
              <div className="mt-12">
                <BadgeGallery earnedBadges={earnedBadges} />
              </div>
            </>
          )}

          {isAdmin && activeTab === 'analytics' && (
            <AnalyticsDashboard isAdmin={isAdmin} />
          )}
        </main>

        <BudgetSettings
          budgets={budgets}
          onSaveBudget={handleSaveBudget}
          onClose={() => setIsSettingsOpen(false)}
          isOpen={isSettingsOpen}
        />
      </div>
    </div>
  )
}

export function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }
    void checkUser()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <BudgetGuardApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminOnlyRoute>
            <AdminAnalytics />
          </AdminOnlyRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

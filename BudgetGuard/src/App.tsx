import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AuthPage from './components/AuthPage'
import { AdminAnalytics } from './pages/AdminAnalytics'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'
import { BudgetSettings } from './components/BudgetSettings'
import { useAuth } from './hooks/useAuth'
import { useExpenses } from './hooks/useExpenses'
import type { Category } from './types'
import { isSupabaseConfigured } from './lib/supabase'
import { trackEvent } from './services/analyticsService'
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  DEFAULT_BUDGETS,
} from './utils/storage'

export interface Budgets {
  [category: string]: number
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
  const { session, user, loading, logout } = useAuth()
  const {
    expenses,
    loading: expensesLoading,
    addExpense,
    deleteExpense,
  } = useExpenses(user?.id)

  const [budgets, setBudgets] = useState<Budgets>({ ...DEFAULT_BUDGETS })
  const [darkMode, setDarkMode] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const saved = loadFromLocalStorage()
    setBudgets(saved.budgets)
    if (saved.darkMode) {
      setDarkMode(saved.darkMode)
    }
  }, [])

  useEffect(() => {
    saveToLocalStorage(budgets, darkMode)
  }, [budgets, darkMode])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const handleAddExpense = async (
    amount: number,
    category: string,
    date: string,
    notes: string,
  ) => {
    if (!user) return

    await addExpense({
      user_id: user.id,
      amount,
      category: category as Category,
      date,
      notes: notes || null,
    })
  }

  const setBudgetLimit = (category: string, amount: number) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: amount,
    }))
  }

  const handleSaveBudget = (category: string, amount: number) => {
    setBudgetLimit(category, amount)
  }

  if (!isSupabaseConfigured) {
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

  if (!session) {
    return <AuthPage />
  }

  const userId = user!.id

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
            <a
              href="/admin/analytics"
              className="rounded-lg border border-white/30 bg-white/10 px-2 py-2 text-xs font-medium text-white transition hover:bg-white/20 sm:px-3 sm:text-sm"
            >
              📊 <span className="hidden sm:inline">Admin Analytics</span>
              <span className="sm:hidden">Admin</span>
            </a>
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

        <main className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
          <ExpenseForm userId={userId} onAddExpense={handleAddExpense} />
          <Dashboard
            userId={userId}
            expenses={expenses}
            budgets={budgets}
            expensesLoading={expensesLoading}
            onSetBudgetLimit={setBudgetLimit}
          />
          <ExpenseList
            userId={userId}
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
          />
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

function App() {
  return (
    <Routes>
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/*" element={<BudgetGuardApp />} />
    </Routes>
  )
}

export default App

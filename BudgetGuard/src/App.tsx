import { useEffect, useState } from 'react'
import AuthPage from './components/AuthPage'
import { useBadges } from './hooks/useBadges'
import { BadgeGallery } from './components/BadgeGallery'
import { Celebration } from './components/Celebration'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'
import { BudgetSettings } from './components/BudgetSettings'
import { useAuth } from './hooks/useAuth'
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  DEFAULT_BUDGETS,
} from './utils/storage'

export interface Expense {
  id: number
  amount: number
  category: string
  date: string
  notes: string
  timestamp: number
}

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

function App() {
  const { session, user, loading, logout } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budgets>({ ...DEFAULT_BUDGETS })
  const [darkMode, setDarkMode] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { earnedBadges, newlyEarned } = useBadges(expenses, budgets)

  useEffect(() => {
    const saved = loadFromLocalStorage()
    if (saved.expenses.length > 0) {
      setExpenses(saved.expenses)
    }
    setBudgets(saved.budgets)
    if (saved.darkMode) {
      setDarkMode(saved.darkMode)
    }
  }, [])

  useEffect(() => {
    saveToLocalStorage(expenses, budgets, darkMode)
  }, [expenses, budgets, darkMode])

  const addExpense = (
    amount: number,
    category: string,
    date: string,
    notes: string,
  ) => {
    const newExpense: Expense = {
      id: Date.now(),
      amount,
      category,
      date,
      notes,
      timestamp: Date.now(),
    }
    setExpenses((prev) => [...prev, newExpense])
  }

  const deleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
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

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <header className="flex items-center justify-between bg-blue-600 px-4 py-4 text-white shadow-md dark:bg-blue-900 sm:px-6">
          <h1 className="text-2xl font-bold sm:text-3xl">BudgetGuard</h1>
          <div className="flex items-center gap-2">
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
              onClick={() => setDarkMode(!darkMode)}
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
          {newlyEarned.length > 0 && (
            <Celebration show={true} badgeName={newlyEarned[0]} />
          )}
          <ExpenseForm userId={userId} onAddExpense={addExpense} />
          <Dashboard
            userId={userId}
            expenses={expenses}
            budgets={budgets}
            onSetBudgetLimit={setBudgetLimit}
          />
          <ExpenseList
            userId={userId}
            expenses={expenses}
            onDeleteExpense={deleteExpense}
          />
          <div className="mt-12">
            <BadgeGallery earnedBadges={earnedBadges} />
          </div>
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

export default App

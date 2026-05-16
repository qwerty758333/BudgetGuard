import { useEffect, useState } from 'react'
import AuthPage from './components/AuthPage'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'
import { BudgetSettings } from './components/BudgetSettings'
import { useAuth } from './hooks/useAuth'
import { useExpenses } from './hooks/useExpenses'
import type { Category } from './types'
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  DEFAULT_BUDGETS,
} from './utils/storage'

export interface Budgets {
  [category: string]: number
}

function App() {
  const { session, user, loading, logout } = useAuth()
  const {
    expenses,
    loading: expensesLoading,
    addExpense,
    deleteExpense,
  } = useExpenses(user?.id)

  const [budgets, setBudgets] = useState<Budgets>(DEFAULT_BUDGETS)
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

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id)
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-5xl">🛡️</div>
          <p className="text-lg text-gray-500">Loading BudgetGuard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  const userId = user!.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-blue-600 px-6 py-4 text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-2xl font-bold">BudgetGuard</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-blue-700 px-3 text-xl transition hover:bg-blue-800"
              aria-label="Open budget settings"
            >
              ⚙️
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg px-3 py-2 text-sm text-blue-100 transition-colors hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
        <ExpenseForm userId={userId} onAddExpense={handleAddExpense} />
        <Dashboard
          userId={userId}
          expenses={expenses}
          budgets={budgets}
          expensesLoading={expensesLoading}
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
  )
}

export default App

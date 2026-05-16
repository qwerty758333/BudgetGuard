import { useState } from 'react'
import AuthPage from './components/AuthPage'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'
import { useAuth } from './hooks/useAuth'

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

const DEFAULT_BUDGETS: Budgets = {
  Food: 300,
  Entertainment: 100,
  Education: 200,
  Transport: 150,
  Shopping: 200,
  Healthcare: 100,
  Other: 100,
}

function App() {
  const { session, user, loading, logout } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budgets>(DEFAULT_BUDGETS)

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
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#1F2937] dark:bg-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white"
              aria-hidden
            >
              BG
            </span>
            <h1 className="text-xl font-semibold tracking-tight">BudgetGuard</h1>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm text-gray-500 transition-colors hover:text-red-500"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <section className="w-full space-y-6 lg:w-1/2 lg:shrink-0">
            <ExpenseForm userId={userId} onAddExpense={addExpense} />
            <ExpenseList
              userId={userId}
              expenses={expenses}
              onDeleteExpense={deleteExpense}
            />
          </section>

          <section className="w-full lg:w-1/2">
            <Dashboard
              userId={userId}
              expenses={expenses}
              budgets={budgets}
              onSetBudgetLimit={setBudgetLimit}
            />
          </section>
        </div>
      </main>
    </div>
  )
}

export default App

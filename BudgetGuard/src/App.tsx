import { useEffect, useState } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'
import { BudgetSettings } from './components/BudgetSettings'
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

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budgets>(DEFAULT_BUDGETS)
  const [darkMode, setDarkMode] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load data from localStorage on app start
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

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage(expenses, budgets, darkMode)
  }, [expenses, budgets, darkMode])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

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
    console.log('Adding expense:', newExpense)
    setExpenses((prev) => [...prev, newExpense])
  }

  const deleteExpense = (id: number) => {
    console.log('Deleting expense:', id)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 px-6 py-4 text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-2xl font-bold">BudgetGuard</h1>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-blue-700 px-3 text-xl transition hover:bg-blue-800"
            aria-label="Open budget settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
        <ExpenseForm onAddExpense={addExpense} />
        <Dashboard expenses={expenses} budgets={budgets} />
        <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
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


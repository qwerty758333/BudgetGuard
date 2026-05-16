import { useEffect, useState } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage'

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
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budgets>(DEFAULT_BUDGETS)
  const [darkMode, setDarkMode] = useState(false)

  // Load data from localStorage on app start
  useEffect(() => {
    const saved = loadFromLocalStorage()
    if (saved.expenses.length > 0) {
      setExpenses(saved.expenses)
    }
    if (Object.keys(saved.budgets).length > 0) {
      setBudgets(saved.budgets)
    }
    if (saved.darkMode) {
      setDarkMode(saved.darkMode)
    }
  }, []) // Empty array means run once on mount

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 px-6 py-4 text-white shadow-md">
        <h1 className="text-center text-2xl font-bold">BudgetGuard</h1>
      </header>

      <main className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
        <ExpenseForm onAddExpense={addExpense} />
        <Dashboard
          expenses={expenses}
          budgets={budgets}
          onSetBudgetLimit={setBudgetLimit}
        />
        <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
      </main>
    </div>
  )
}

export default App

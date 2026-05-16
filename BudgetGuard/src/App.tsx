import { useState } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <header className="flex items-center justify-between bg-blue-600 p-4 text-white dark:bg-blue-900">
          <h1 className="text-2xl font-bold sm:text-3xl">BudgetGuard</h1>
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20 sm:px-4 sm:text-base"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </header>

        <main className="p-4 md:p-8">
          <section className="mb-8">
            <ExpenseForm />
          </section>

          <section className="mb-8">
            <Dashboard />
          </section>

          <section>
            <ExpenseList />
          </section>
        </main>
      </div>
    </div>
<<<<<<< HEAD
=======
  );
import { useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import Dashboard from './components/Dashboard'
import ExpenseList from './components/ExpenseList'

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
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold text-center">BudgetGuard</h1>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <ExpenseForm onAddExpense={addExpense} />
        <Dashboard expenses={expenses} budgets={budgets} />
        <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
      </main>
    </div>
>>>>>>> 48b87abb7adbb8039e2fe8d3cec8cef1d9f847bd
  )
}

export default App
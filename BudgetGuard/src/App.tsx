<<<<<<< HEAD
function App() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#1F2937] dark:bg-gray-900 dark:text-gray-100">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* App branding */}
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white"
              aria-hidden
            >
              BG
            </span>
            <h1 className="text-xl font-semibold tracking-tight">BudgetGuard</h1>
          </div>

          {/* DarkModeToggle — wire up theme state later */}
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            aria-label="Toggle dark mode"
          >
            Dark mode
          </button>
        </div>
      </header>

      {/* ─── Main content ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* ─── Left column: Expense entry ─────────────────────────────── */}
          <section
            className="w-full rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 lg:w-1/2 lg:shrink-0"
            aria-labelledby="expense-form-heading"
          >
            {/* ExpenseForm */}
            <h2 id="expense-form-heading" className="mb-4 text-lg font-semibold">
              Add expense
            </h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Expense entry form — amount, category, date, notes
            </p>

            <div className="space-y-4">
              {/* ExpenseForm — AmountField */}
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                Amount field placeholder
              </div>

              {/* ExpenseForm — CategorySelect */}
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                Category select placeholder
              </div>

              {/* ExpenseForm — DatePicker */}
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                Date picker placeholder
              </div>

              {/* ExpenseForm — NotesField */}
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                Notes field placeholder
              </div>

              {/* ExpenseForm — SubmitButton */}
              <div className="rounded-lg bg-[#2563EB] px-4 py-3 text-center text-sm font-medium text-white opacity-60">
                Submit expense (placeholder)
              </div>
            </div>
          </section>

          {/* ─── Right column: Dashboard & related widgets ────────────────── */}
          <section className="flex w-full flex-col gap-6 lg:w-1/2">
            {/* Dashboard */}
            <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold">Dashboard</h2>

              {/* SpendingSummary */}
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                  Total spent placeholder
                </div>
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                  This week placeholder
                </div>
                <div className="col-span-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-center text-xs text-gray-500 sm:col-span-1 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                  Remaining budget placeholder
                </div>
              </div>

              {/* PieChart — Recharts category breakdown */}
              <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                Pie chart placeholder (Recharts)
              </div>
            </div>

            {/* BudgetTracker — animated SVG progress rings */}
            <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold">Budget tracking</h2>
              <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                Budget progress rings placeholder (SVG)
              </div>
            </div>

            {/* WeeklyChallenges */}
            <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold">Weekly challenges</h2>
              <div className="space-y-3">
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                  Challenge card placeholder
                </div>
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                  Challenge card placeholder
                </div>
              </div>
            </div>

            {/* BadgeSystem — achievements with confetti */}
            <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold">Achievements</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="aspect-square rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-xs leading-tight text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400 flex items-center justify-center p-2">
                  Badge placeholder
                </div>
                <div className="aspect-square rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-xs leading-tight text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400 flex items-center justify-center p-2">
                  Badge placeholder
                </div>
                <div className="aspect-square rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-xs leading-tight text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400 flex items-center justify-center p-2">
                  Badge placeholder
                </div>
                <div className="aspect-square rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-xs leading-tight text-gray-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400 flex items-center justify-center p-2">
                  Badge placeholder
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                Confetti animation on unlock (placeholder)
              </p>
            </div>
          </section>
        </div>
=======
import { useState } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'

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
>>>>>>> d569dabd0a6be5d826eee527b038ecce4869f31f
      </main>
    </div>
  )
}

export default App

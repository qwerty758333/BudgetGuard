import { StatCard } from './StatCard'
import { SpendingChart } from './SpendingChart'
import type { Budgets } from '../App'
import type { Expense } from '../types'
import {
  getTotalSpent,
  getTotalBudget,
  getCategoryBreakdownData,
} from '../utils/budgetCalculations'
import { formatCurrency } from '../utils/currency'

interface DashboardProps {
  userId: string
  expenses: Expense[]
  budgets: Budgets
  expensesLoading?: boolean
  onSetBudgetLimit?: (category: string, amount: number) => void
}

export function Dashboard({
  userId,
  expenses,
  budgets,
  expensesLoading = false,
}: DashboardProps) {
  void userId
  const totalSpent = getTotalSpent(expenses)
  const totalBudget = getTotalBudget(budgets)
  const remainingBudget = totalBudget - totalSpent
  const chartData = getCategoryBreakdownData(expenses)
  const categoryCount = chartData.length

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Track your spending and see how much budget you have left.
        </p>
      </header>

      <section
        aria-label="Budget overview"
        className="grid grid-cols-1 gap-4 min-[320px]:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
      >
        <StatCard label="Total Spent" value={formatCurrency(totalSpent)} />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(remainingBudget)}
        />
        <StatCard label="Categories" value={categoryCount} />
      </section>

      <section aria-label="Spending by category" className="mt-8 sm:mt-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
          Spending by Category
        </h2>
        {expensesLoading && expenses.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-400">Loading your expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <article className="flex min-h-[240px] w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center sm:min-h-[280px] sm:p-8">
            <p className="max-w-sm text-sm text-gray-500 sm:text-base">
              Add an expense to see your spending breakdown!
            </p>
          </article>
        ) : (
          <SpendingChart data={chartData} />
        )}
      </section>
    </main>
  )
}

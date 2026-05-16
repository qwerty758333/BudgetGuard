import { StatCard } from './StatCard'
import type { Expense, Budgets } from '../App'

interface DashboardProps {
  userId: string
  expenses: Expense[]
  budgets: Budgets
  onSetBudgetLimit?: (category: string, amount: number) => void
}

export function Dashboard({ userId, expenses, budgets }: DashboardProps) {
  void userId
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalBudget = Object.values(budgets).reduce((sum, n) => sum + n, 0)
  const remaining = totalBudget - totalSpent
  const categoryCount = new Set(expenses.map((e) => e.category)).size
  return (
    <div className="w-full">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Dashboard
        </h1>
      </header>

      <section
        aria-label="Budget overview"
        className="grid grid-cols-1 gap-4 min-[320px]:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
      >
        <StatCard
          label="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
        />
        <StatCard
          label="Remaining Budget"
          value={`$${remaining.toFixed(2)}`}
        />
        <StatCard label="Categories" value={categoryCount} />
      </section>

      <section aria-label="Spending by category" className="mt-8 sm:mt-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
          Spending by Category
        </h2>
        <article className="flex min-h-[240px] w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center sm:min-h-[280px] sm:p-8">
          <p className="max-w-sm text-sm text-gray-500 sm:text-base">
            Chart coming soon — spending breakdown by category will appear here.
          </p>
        </article>
      </section>
    </div>
  )
}

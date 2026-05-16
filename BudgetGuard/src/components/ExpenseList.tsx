import type { Expense } from '../App'
import { formatCurrency } from '../utils/currency'

const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍽️',
  Entertainment: '🎬',
  Education: '📚',
  Transport: '🚗',
  Shopping: '🛍️',
  Healthcare: '🏥',
  Other: '📌',
}

function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? '📌'
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
      aria-label="Delete expense"
    >
      <span aria-hidden>🗑️</span>
    </button>
  )
}

interface ExpenseRowProps {
  expense: Expense
  onDelete: (id: number) => void
}

function ExpenseCard({ expense, onDelete }: ExpenseRowProps) {
  return (
    <li className="rounded-xl bg-white p-4 shadow-md dark:bg-gray-800 dark:shadow-lg">
      <article className="flex items-start justify-between gap-3">
        <section className="min-w-0 flex-1 space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <span aria-hidden>{getCategoryEmoji(expense.category)}</span>
            <span>{expense.category}</span>
          </p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(expense.amount)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(expense.date)}</p>
          {expense.notes ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">{expense.notes}</p>
          ) : (
            <p className="text-sm italic text-gray-400 dark:text-gray-500">No notes</p>
          )}
        </section>
        <DeleteButton onClick={() => onDelete(expense.id)} />
      </article>
    </li>
  )
}

interface ExpenseListProps {
  userId: string
  expenses: Expense[]
  onDeleteExpense: (id: number) => void
}

export function ExpenseList({ userId, expenses, onDeleteExpense }: ExpenseListProps) {
  void userId
  if (expenses.length === 0) {
    return (
      <section className="w-full">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">
          Recent Expenses
        </h2>
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No expenses yet. Add one to get started!
        </p>
      </section>
    )
  }

  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
        Recent Expenses
      </h2>

      <ul className="flex flex-col gap-3 md:hidden">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onDelete={onDeleteExpense}
          />
        ))}
      </ul>

      <section className="hidden overflow-x-auto rounded-xl bg-white shadow-md dark:bg-gray-800 dark:shadow-lg md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-400">
              <th className="px-4 py-3 sm:px-6">Category</th>
              <th className="px-4 py-3 sm:px-6">Amount</th>
              <th className="px-4 py-3 sm:px-6">Date</th>
              <th className="px-4 py-3 sm:px-6">Notes</th>
              <th className="px-4 py-3 sm:px-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {expenses.map((expense) => (
              <tr key={expense.id} className="text-gray-700 dark:text-gray-300">
                <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100 sm:px-6">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>{getCategoryEmoji(expense.category)}</span>
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-4 font-semibold text-blue-600 dark:text-blue-400 sm:px-6">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-400 sm:px-6">
                  {formatDate(expense.date)}
                </td>
                <td className="max-w-xs truncate px-4 py-4 text-gray-600 dark:text-gray-300 sm:px-6">
                  {expense.notes || (
                    <span className="italic text-gray-400 dark:text-gray-500">No notes</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right sm:px-6">
                  <DeleteButton onClick={() => onDeleteExpense(expense.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}

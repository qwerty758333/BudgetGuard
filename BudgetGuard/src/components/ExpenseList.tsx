import type { Expense } from '../App'

const CATEGORIES = [
  'Food',
  'Entertainment',
  'Education',
  'Transport',
  'Shopping',
  'Healthcare',
  'Other',
] as const

type Category = (typeof CATEGORIES)[number]

const CATEGORY_EMOJI: Record<Category, string> = {
  Food: '🍔',
  Entertainment: '🎬',
  Education: '📚',
  Transport: '🚗',
  Shopping: '🛍️',
  Healthcare: '🏥',
  Other: '📦',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
      aria-label="Delete expense"
    >
      <TrashIcon />
    </button>
  )
}

interface ExpenseRowProps {
  expense: Expense
  onDelete: (id: number) => void
}

function ExpenseCard({ expense, onDelete }: ExpenseRowProps) {
  return (
    <li className="rounded-xl bg-white p-4 shadow-md">
      <article className="flex items-start justify-between gap-3">
        <section className="min-w-0 flex-1 space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <span aria-hidden>
              {CATEGORY_EMOJI[expense.category as Category] ?? '📦'}
            </span>
            <span>{expense.category}</span>
          </p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(expense.amount)}
          </p>
          <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
          {expense.notes ? (
            <p className="text-sm text-gray-600">{expense.notes}</p>
          ) : (
            <p className="text-sm italic text-gray-400">No notes</p>
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
          Recent Expenses
        </h2>
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No expenses yet.
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

      <section className="hidden overflow-x-auto rounded-xl bg-white shadow-md md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 sm:px-6">Category</th>
              <th className="px-4 py-3 sm:px-6">Amount</th>
              <th className="px-4 py-3 sm:px-6">Date</th>
              <th className="px-4 py-3 sm:px-6">Notes</th>
              <th className="px-4 py-3 sm:px-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="text-gray-700">
                <td className="px-4 py-4 font-medium text-gray-900 sm:px-6">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>
              {CATEGORY_EMOJI[expense.category as Category] ?? '📦'}
            </span>
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-4 font-semibold text-blue-600 sm:px-6">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-4 text-gray-600 sm:px-6">
                  {formatDate(expense.date)}
                </td>
                <td className="max-w-xs truncate px-4 py-4 text-gray-600 sm:px-6">
                  {expense.notes || (
                    <span className="italic text-gray-400">No notes</span>
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

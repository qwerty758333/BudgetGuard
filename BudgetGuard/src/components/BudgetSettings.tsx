import { useEffect, useState } from 'react'
import { getTotalBudget } from '../utils/budgetCalculations'
import { convertUsdToLkr, formatCurrency } from '../utils/currency'
import { DEFAULT_BUDGETS } from '../utils/storage'

const CATEGORIES = [
  { name: 'Food', emoji: '🍽️' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Education', emoji: '📚' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Healthcare', emoji: '🏥' },
  { name: 'Other', emoji: '📌' },
] as const

const MIN_BUDGET = 0
const MAX_BUDGET = convertUsdToLkr(10000)

export interface BudgetSettingsProps {
  budgets: Record<string, number>
  onSaveBudget: (category: string, amount: number) => void
  onClose: () => void
  isOpen: boolean
}

function validateBudget(value: string): string | null {
  if (value.trim() === '') {
    return 'Enter a budget amount'
  }

  const amount = Number(value)

  if (Number.isNaN(amount)) {
    return 'Must be a valid number'
  }

  if (amount < MIN_BUDGET) {
    return 'Cannot be negative'
  }

  if (amount > MAX_BUDGET) {
    return `Maximum is LKR ${MAX_BUDGET.toLocaleString('en-LK')}`
  }

  return null
}

export function BudgetSettings({
  budgets,
  onSaveBudget,
  onClose,
  isOpen,
}: BudgetSettingsProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmation, setConfirmation] = useState('')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const initialDrafts = CATEGORIES.reduce<Record<string, string>>(
      (acc, category) => {
        acc[category.name] = String(
          budgets[category.name] ?? DEFAULT_BUDGETS[category.name],
        )
        return acc
      },
      {},
    )

    setDrafts(initialDrafts)
    setErrors({})
    setConfirmation('')
  }, [isOpen, budgets])

  if (!isOpen) {
    return null
  }

  const totalBudget = getTotalBudget(budgets)

  const handleDraftChange = (category: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [category]: value }))
    setErrors((prev) => ({ ...prev, [category]: '' }))
    setConfirmation('')
  }

  const handleSave = (category: string) => {
    const error = validateBudget(drafts[category] ?? '')

    if (error) {
      setErrors((prev) => ({ ...prev, [category]: error }))
      return
    }

    onSaveBudget(category, Number(drafts[category]))
    setConfirmation('Budget updated!')
    window.setTimeout(() => {
      onClose()
    }, 600)
  }

  const handleReset = (category: string) => {
    const defaultAmount = DEFAULT_BUDGETS[category]
    setDrafts((prev) => ({ ...prev, [category]: String(defaultAmount) }))
    setErrors((prev) => ({ ...prev, [category]: '' }))
    setConfirmation('')
    onSaveBudget(category, defaultAmount)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-settings-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl transition-all duration-200 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-6 flex items-center justify-between gap-4">
          <h2
            id="budget-settings-title"
            className="text-xl font-bold text-gray-900 sm:text-2xl"
          >
            Budget Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            aria-label="Close budget settings"
          >
            Close
          </button>
        </header>

        {confirmation ? (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {confirmation}
          </p>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const error = errors[category.name]
            const isInvalid = Boolean(validateBudget(drafts[category.name] ?? ''))

            return (
              <article
                key={category.name}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {category.emoji}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>

                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Monthly limit
                </label>
                <input
                  type="number"
                  min={MIN_BUDGET}
                  max={MAX_BUDGET}
                  step="0.01"
                  value={drafts[category.name] ?? ''}
                  onChange={(event) =>
                    handleDraftChange(category.name, event.target.value)
                  }
                  className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                {error ? (
                  <p className="mb-3 text-sm text-red-600">{error}</p>
                ) : (
                  <div className="mb-3" />
                )}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleSave(category.name)}
                    disabled={isInvalid}
                    className="min-h-11 flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReset(category.name)}
                    className="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Reset
                  </button>
                </div>
              </article>
            )
          })}
        </section>

        <footer className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-center">
          <p className="text-sm font-medium text-gray-600">Total Budget</p>
          <p className="text-xl font-bold text-blue-600">
            {formatCurrency(totalBudget)}
          </p>
        </footer>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'

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

export interface ExpenseFormData {
  amount: number
  category: Category
  date: string
  notes: string
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function getInitialState() {
  return {
    amount: '',
    category: 'Food' as Category,
    date: getTodayDate(),
    notes: '',
  }
}

const inputClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-base'

const labelClassName = 'mb-1.5 block text-sm font-medium text-gray-500'

interface ExpenseFormProps {
  onAddExpense: (
    amount: number,
    category: string,
    date: string,
    notes: string,
  ) => void
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [amount, setAmount] = useState(getInitialState().amount)
  const [category, setCategory] = useState<Category>(getInitialState().category)
  const [date, setDate] = useState(getInitialState().date)
  const [notes, setNotes] = useState(getInitialState().notes)

  const resetForm = () => {
    const initial = getInitialState()
    setAmount(initial.amount)
    setCategory(initial.category)
    setDate(initial.date)
    setNotes(initial.notes)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData: ExpenseFormData = {
      amount: Number(amount),
      category,
      date,
      notes: notes.trim(),
    }

    onAddExpense(formData.amount, formData.category, formData.date, formData.notes)
    resetForm()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl bg-white p-4 shadow-md sm:p-6"
    >
      <fieldset className="grid grid-cols-1 gap-4 border-0 p-0 sm:grid-cols-2 sm:gap-5">
        <label className="block">
          <span className={labelClassName}>Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClassName}
            placeholder="0.00"
          />
        </label>

        <label className="block">
          <span className={labelClassName}>Category</span>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={inputClassName}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClassName}>Date</span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClassName}>
            Notes <span className="font-normal text-gray-400">(optional)</span>
          </span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClassName} resize-y`}
            placeholder="Add a note..."
          />
        </label>
      </fieldset>

      <section className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={resetForm}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto sm:text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto sm:text-base"
        >
          Add Expense
        </button>
      </section>
    </form>
  )
}

import type { Category, Expense } from '../types'
import { getUserExpenses, saveUserExpenses } from './storage'

function sortExpenses(rows: Expense[]): Expense[] {
  return [...rows].sort((a, b) => {
    const aTime = new Date(a.created_at || a.date).getTime()
    const bTime = new Date(b.created_at || b.date).getTime()
    return bTime - aTime
  })
}

export function normalizeStoredExpense(row: Expense): Expense {
  return {
    ...row,
    amount: typeof row.amount === 'string' ? Number(row.amount) : row.amount,
    date:
      typeof row.date === 'string' && row.date.includes('T')
        ? row.date.slice(0, 10)
        : row.date,
  }
}

export async function loadExpensesForUser(userId: string): Promise<Expense[]> {
  const rows = await getUserExpenses(userId)
  return sortExpenses(rows.map(normalizeStoredExpense))
}

export async function saveExpensesForUser(
  userId: string,
  expenses: Expense[],
): Promise<void> {
  saveUserExpenses(userId, sortExpenses(expenses.map(normalizeStoredExpense)))
}

export function createLocalExpense(
  userId: string,
  expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>,
): Expense {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    amount: expense.amount,
    category: expense.category as Category,
    date: expense.date,
    notes: expense.notes ?? null,
    created_at: new Date().toISOString(),
  }
}

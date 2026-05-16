export type Category =
  | 'Food'
  | 'Entertainment'
  | 'Education'
  | 'Transport'
  | 'Shopping'
  | 'Healthcare'
  | 'Other'

export interface Expense {
  id: number
  amount: number
  category: Category
  date: string
  notes: string
  timestamp: number
}

export interface Budget {
  category: Category
  limit: number
  spent: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: number | null
  criteria: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  startDate: string
  endDate: string
  completed: boolean
  category?: Category
}

export const CATEGORIES: Category[] = [
  'Food',
  'Entertainment',
  'Education',
  'Transport',
  'Shopping',
  'Healthcare',
  'Other',
]

export const DEFAULT_BUDGET_LIMITS: Record<Category, number> = {
  Food: 300,
  Entertainment: 100,
  Education: 200,
  Transport: 150,
  Shopping: 200,
  Healthcare: 100,
  Other: 100,
}

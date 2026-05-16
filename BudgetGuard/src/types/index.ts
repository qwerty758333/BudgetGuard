export type Category =
  | 'Food'
  | 'Entertainment'
  | 'Education'
  | 'Transport'
  | 'Shopping'
  | 'Healthcare'
  | 'Other'

export interface Expense {
  id: string
  user_id: string
  amount: number
  category: Category
  date: string
  notes: string | null
  created_at: string
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

import { convertUsdToLkr } from '../utils/currency'

export const DEFAULT_BUDGET_LIMITS: Record<Category, number> = {
  Food: convertUsdToLkr(300),
  Entertainment: convertUsdToLkr(100),
  Education: convertUsdToLkr(200),
  Transport: convertUsdToLkr(150),
  Shopping: convertUsdToLkr(200),
  Healthcare: convertUsdToLkr(100),
  Other: convertUsdToLkr(100),
}

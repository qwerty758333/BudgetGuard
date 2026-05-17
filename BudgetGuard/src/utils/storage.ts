import type { Expense } from '../types'
import { convertUsdToLkr } from './currency'

const DARK_MODE_KEY = 'budgetguard-darkmode'

/** Default limits for UI fallbacks when a category has no Supabase budget row yet. */
export const DEFAULT_BUDGETS: Record<string, number> = {
  Food: convertUsdToLkr(300),
  Entertainment: convertUsdToLkr(100),
  Education: convertUsdToLkr(200),
  Transport: convertUsdToLkr(150),
  Shopping: convertUsdToLkr(200),
  Healthcare: convertUsdToLkr(100),
  Other: convertUsdToLkr(100),
}

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }

    const testKey = '__budgetguard_storage_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export function saveToLocalStorage(darkMode: boolean): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode))
  } catch {
    // Silently ignore storage errors
  }
}

/** Get user's expenses from local storage (scoped by user id). */
export async function getUserExpenses(userId: string): Promise<Expense[]> {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(`expenses_${userId}`)
    const expenses = JSON.parse(raw || '[]') as Expense[]
    return Array.isArray(expenses) ? expenses : []
  } catch {
    return []
  }
}

/** Save user's expenses to local storage (scoped by user id). */
export function saveUserExpenses(userId: string, expenses: Expense[]): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(`expenses_${userId}`, JSON.stringify(expenses))
  } catch {
    // Silently ignore storage errors
  }
}

/** Get user's budget limits from local storage. */
export function getUserBudgets(userId: string): Record<string, number> {
  if (!isLocalStorageAvailable()) {
    return { ...DEFAULT_BUDGETS }
  }

  try {
    const raw = window.localStorage.getItem(`budgets_${userId}`)
    if (!raw) return { ...DEFAULT_BUDGETS }
    const budgets = JSON.parse(raw) as Record<string, number>
    return typeof budgets === 'object' && budgets !== null ? budgets : { ...DEFAULT_BUDGETS }
  } catch {
    return { ...DEFAULT_BUDGETS }
  }
}

/** Save user's budget limits to local storage. */
export function saveUserBudgets(userId: string, budgets: Record<string, number>): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(`budgets_${userId}`, JSON.stringify(budgets))
  } catch {
    // Silently ignore storage errors
  }
}

/** Get earned badge ids for a user from local storage. */
export function getUserBadges(userId: string): string[] {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(`badges_${userId}`)
    const badges = JSON.parse(raw || '[]') as string[]
    return Array.isArray(badges) ? badges : []
  } catch {
    return []
  }
}

/** Save earned badge ids for a user to local storage. */
export function saveUserBadges(userId: string, badges: string[]): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(`badges_${userId}`, JSON.stringify(badges))
  } catch {
    // Silently ignore storage errors
  }
}

export interface StoredAnalyticsEvent {
  type: string
  data: Record<string, unknown>
  timestamp: number
  userId?: string
}

/** Load analytics events for a user (falls back to global key). */
export function loadAnalyticsEvents(userId?: string): StoredAnalyticsEvent[] {
  if (!isLocalStorageAvailable()) {
    return []
  }

  const key = userId ? `budgetguard_events_${userId}` : 'budgetguard_events'

  try {
    const raw = window.localStorage.getItem(key)
    const events = JSON.parse(raw || '[]') as StoredAnalyticsEvent[]
    return Array.isArray(events) ? events : []
  } catch {
    return []
  }
}

/** Save analytics events, keeping only the last 100. */
export function saveAnalyticsEvents(
  events: StoredAnalyticsEvent[],
  userId?: string,
): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  const key = userId ? `budgetguard_events_${userId}` : 'budgetguard_events'

  try {
    const trimmed = events.slice(-100)
    window.localStorage.setItem(key, JSON.stringify(trimmed))
  } catch {
    // Silently ignore storage errors
  }
}

export function loadFromLocalStorage(): {
  darkMode: boolean
} {
  if (!isLocalStorageAvailable()) {
    return {
      darkMode: false,
    }
  }

  try {
    const darkModeRaw = window.localStorage.getItem(DARK_MODE_KEY)
    const darkMode = darkModeRaw ? JSON.parse(darkModeRaw) : false

    return {
      darkMode: typeof darkMode === 'boolean' ? darkMode : false,
    }
  } catch {
    return {
      darkMode: false,
    }
  }
}

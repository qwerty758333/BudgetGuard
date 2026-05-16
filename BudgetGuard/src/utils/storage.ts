const BUDGETS_KEY = 'budgetguard-budgets'
const CUSTOM_BUDGETS_KEY = 'budgetguard-custom-budgets'
const DARK_MODE_KEY = 'budgetguard-darkmode'

import { convertUsdToLkr } from './currency'

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

function parseBudgets(raw: string | null): Record<string, number> | null {
  if (!raw) {
    return null
  }

  const parsed = JSON.parse(raw)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, number>
  }

  return null
}

export function saveCustomBudgets(budgets: Record<string, number>): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(CUSTOM_BUDGETS_KEY, JSON.stringify(budgets))
  } catch {
    // Silently ignore storage errors
  }
}

export function loadCustomBudgets(): Record<string, number> {
  if (!isLocalStorageAvailable()) {
    return { ...DEFAULT_BUDGETS }
  }

  try {
    const customRaw = window.localStorage.getItem(CUSTOM_BUDGETS_KEY)
    const custom = parseBudgets(customRaw)

    if (custom && Object.keys(custom).length > 0) {
      return { ...DEFAULT_BUDGETS, ...custom }
    }

    const legacyRaw = window.localStorage.getItem(BUDGETS_KEY)
    const legacy = parseBudgets(legacyRaw)

    if (legacy && Object.keys(legacy).length > 0) {
      return { ...DEFAULT_BUDGETS, ...legacy }
    }

    return { ...DEFAULT_BUDGETS }
  } catch {
    return { ...DEFAULT_BUDGETS }
  }
}

export function saveToLocalStorage(
  budgets: Record<string, number>,
  darkMode: boolean,
): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode))
    saveCustomBudgets(budgets)
  } catch {
    // Silently ignore storage errors
  }
}

export function loadFromLocalStorage(): {
  expenses: any[]
  budgets: Record<string, number>
  darkMode: boolean
} {
  if (!isLocalStorageAvailable()) {
    return {
      expenses: [],
      budgets: { ...DEFAULT_BUDGETS },
      darkMode: false,
    }
  }

  try {
    const darkModeRaw = window.localStorage.getItem(DARK_MODE_KEY)
    const darkMode = darkModeRaw ? JSON.parse(darkModeRaw) : false

    return {
      expenses: [],
      budgets: loadCustomBudgets(),
      darkMode: typeof darkMode === 'boolean' ? darkMode : false,
    }
  } catch {
    return {
      expenses: [],
      budgets: { ...DEFAULT_BUDGETS },
      darkMode: false,
    }
  }
}

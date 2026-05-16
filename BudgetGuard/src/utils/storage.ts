const EXPENSES_KEY = 'budgetguard-expenses'
const BUDGETS_KEY = 'budgetguard-budgets'
const DARK_MODE_KEY = 'budgetguard-darkmode'

const DEFAULT_LOAD_RESULT = {
  expenses: [] as any[],
  budgets: {} as Record<string, number>,
  darkMode: false,
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

export function saveToLocalStorage(
  expenses: any[],
  budgets: Record<string, number>,
  darkMode: boolean,
): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
    window.localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets))
    window.localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode))
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
    return { ...DEFAULT_LOAD_RESULT }
  }

  try {
    const expensesRaw = window.localStorage.getItem(EXPENSES_KEY)
    const budgetsRaw = window.localStorage.getItem(BUDGETS_KEY)
    const darkModeRaw = window.localStorage.getItem(DARK_MODE_KEY)

    const expenses = expensesRaw ? JSON.parse(expensesRaw) : []
    const budgets = budgetsRaw ? JSON.parse(budgetsRaw) : {}
    const darkMode = darkModeRaw ? JSON.parse(darkModeRaw) : false

    return {
      expenses: Array.isArray(expenses) ? expenses : [],
      budgets:
        budgets && typeof budgets === 'object' && !Array.isArray(budgets)
          ? budgets
          : {},
      darkMode: typeof darkMode === 'boolean' ? darkMode : false,
    }
  } catch {
    return { ...DEFAULT_LOAD_RESULT }
  }
}

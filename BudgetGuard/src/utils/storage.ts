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

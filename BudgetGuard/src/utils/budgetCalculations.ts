export interface BudgetStatus {
  spent: number
  budget: number
  remaining: number
  percentage: number
  status: 'ok' | 'warning' | 'exceeded'
}

export function getTotalSpent(expenses: any[]): number {
  if (expenses.length === 0) {
    return 0
  }

  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

export function getSpentByCategory(expenses: any[]): Record<string, number> {
  if (expenses.length === 0) {
    return {}
  }

  return expenses.reduce<Record<string, number>>((byCategory, expense) => {
    const category = expense.category
    byCategory[category] = (byCategory[category] ?? 0) + expense.amount
    return byCategory
  }, {})
}

export function getBudgetStatus(spent: number, budget: number): BudgetStatus {
  const remaining = budget - spent
  const percentage = budget === 0 ? 0 : (spent / budget) * 100

  let status: BudgetStatus['status'] = 'ok'
  if (percentage > 100) {
    status = 'exceeded'
  } else if (percentage > 75) {
    status = 'warning'
  }

  return {
    spent,
    budget,
    remaining,
    percentage,
    status,
  }
}

export function getTotalBudget(budgets: Record<string, number>): number {
  const values = Object.values(budgets)
  if (values.length === 0) {
    return 0
  }

  return values.reduce((total, limit) => total + limit, 0)
}

export function getCategoryBreakdownData(
  expenses: any[],
): Array<{ name: string; value: number }> {
  if (expenses.length === 0) {
    return []
  }

  const spentByCategory = getSpentByCategory(expenses)

  return Object.entries(spentByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

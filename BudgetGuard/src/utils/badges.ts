export interface Expense {
    amount: number
    category: string
  }
  
  export interface Budgets {
    total: number
  }
  
  export interface BadgeDefinition {
    id: string
    name: string
    description: string
    icon: string
    condition: (expenses: Expense[], budgets: Budgets) => boolean
  }
  
  export function getSpentByCategory(expenses: Expense[], category: string): number {
    return expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }
  
  export const BADGES: BadgeDefinition[] = [
    {
      id: 'budget-master',
      name: 'Budget Master',
      description: 'Stay under total budget',
      icon: '👑',
      condition: (expenses, budgets) => {
        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
        return totalSpent <= budgets.total
      },
    },
    {
      id: 'meal-prepper',
      name: 'Meal Prepper',
      description: 'Keep food spending under $100',
      icon: '🍽️',
      condition: (expenses) => getSpentByCategory(expenses, 'Food') < 100,
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Entertainment under $50',
      icon: '🎬',
      condition: (expenses) => getSpentByCategory(expenses, 'Entertainment') < 50,
    },
    {
      id: 'scholar',
      name: 'Scholar',
      description: 'Education under $500',
      icon: '📚',
      condition: (expenses) => getSpentByCategory(expenses, 'Education') < 500,
    },
    {
      id: 'efficiency-expert',
      name: 'Efficiency Expert',
      description: 'Transport under $100',
      icon: '🚗',
      condition: (expenses) => getSpentByCategory(expenses, 'Transport') < 100,
    },
  ]
  
  export function checkBadges(expenses: Expense[], budgets: Budgets): string[] {
    return BADGES.filter((badge) => badge.condition(expenses, budgets)).map(
      (badge) => badge.id,
    )
  }
  
  export function getBadgeById(id: string): BadgeDefinition | undefined {
    return BADGES.find((badge) => badge.id === id)
  }
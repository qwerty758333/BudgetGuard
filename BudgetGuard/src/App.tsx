import React from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-3xl font-bold">BudgetGuard</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        {/* Add Expense Form */}
        <div className="mb-8">
          <ExpenseForm />
        </div>

        {/* Dashboard */}
        <div className="mb-8">
          <Dashboard />
        </div>

        {/* Expense List */}
        <div>
          <ExpenseList />
        </div>
      </main>
    </div>
  );
import { useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import Dashboard from './components/Dashboard'
import ExpenseList from './components/ExpenseList'

export interface Expense {
  id: number
  amount: number
  category: string
  date: string
  notes: string
  timestamp: number
}

export interface Budgets {
  [category: string]: number
}

const DEFAULT_BUDGETS: Budgets = {
  Food: 300,
  Entertainment: 100,
  Education: 200,
  Transport: 150,
  Shopping: 200,
  Healthcare: 100,
  Other: 100,
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budgets>(DEFAULT_BUDGETS)

  const addExpense = (
    amount: number,
    category: string,
    date: string,
    notes: string,
  ) => {
    const newExpense: Expense = {
      id: Date.now(),
      amount,
      category,
      date,
      notes,
      timestamp: Date.now(),
    }
    console.log('Adding expense:', newExpense)
    setExpenses((prev) => [...prev, newExpense])
  }

  const deleteExpense = (id: number) => {
    console.log('Deleting expense:', id)
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  const setBudgetLimit = (category: string, amount: number) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: amount,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold text-center">BudgetGuard</h1>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <ExpenseForm onAddExpense={addExpense} />
        <Dashboard expenses={expenses} budgets={budgets} />
        <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
      </main>
    </div>
  )
}

export default App;

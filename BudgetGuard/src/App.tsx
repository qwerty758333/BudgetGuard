import { useState } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <header className="flex items-center justify-between bg-blue-600 p-4 text-white dark:bg-blue-900">
          <h1 className="text-2xl font-bold sm:text-3xl">BudgetGuard</h1>
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20 sm:px-4 sm:text-base"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </header>

        <main className="p-4 md:p-8">
          <section className="mb-8">
            <ExpenseForm />
          </section>

          <section className="mb-8">
            <Dashboard />
          </section>

          <section>
            <ExpenseList />
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
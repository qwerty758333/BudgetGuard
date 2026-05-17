import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <p className="mb-4 text-6xl" aria-hidden>
        🛡️
      </p>
      <h1 className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
        BudgetGuard
      </h1>
      <p className="mb-8 max-w-md text-center text-gray-600 dark:text-gray-400">
        Track spending, set budgets, and earn badges. Take control of your finances.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/login"
          className="rounded-lg bg-[#2563EB] px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}

export default Landing

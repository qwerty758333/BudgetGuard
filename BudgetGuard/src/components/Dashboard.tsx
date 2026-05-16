import { StatCard } from './StatCard'

export function Dashboard() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Dashboard
        </h1>
      </header>

      <section
        aria-label="Budget overview"
        className="grid grid-cols-1 gap-4 min-[320px]:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
      >
        <StatCard label="Total Spent" value="$0.00" />
        <StatCard label="Remaining Budget" value="$1000.00" />
        <StatCard label="Categories" value={0} />
      </section>

      <section aria-label="Spending by category" className="mt-8 sm:mt-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
          Spending by Category
        </h2>
        <article className="flex min-h-[240px] w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center sm:min-h-[280px] sm:p-8">
          <p className="max-w-sm text-sm text-gray-500 sm:text-base">
            Chart coming soon — spending breakdown by category will appear here.
          </p>
        </article>
      </section>
    </main>
  )
}

import type { ReactNode } from 'react'

export interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <article className="flex w-full min-w-0 items-center gap-3 rounded-xl bg-white p-4 shadow-md dark:bg-gray-800 dark:shadow-lg sm:gap-4 sm:p-5">
      {icon != null && (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center text-blue-600 dark:text-blue-400 sm:h-12 sm:w-12"
          aria-hidden
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1 text-left">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">{label}</p>
        <p className="truncate text-xl font-bold text-blue-600 dark:text-blue-400 sm:text-2xl md:text-3xl">
          {value}
        </p>
      </div>
    </article>
  )
}
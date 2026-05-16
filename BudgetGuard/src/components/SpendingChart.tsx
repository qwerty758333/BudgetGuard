import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from 'recharts'

export interface SpendingChartDataItem {
  name: string
  value: number
}

export interface SpendingChartProps {
  data: SpendingChartDataItem[]
}

const COLORS = [
  '#2563EB',
  '#059669',
  '#EA580C',
  '#DC2626',
  '#F59E0B',
  '#8B5CF6',
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function ChartTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0].payload as SpendingChartDataItem

  return (
    <section className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-gray-600 dark:bg-gray-800">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
        {formatCurrency(item.value)}
      </p>
    </section>
  )
}

export function SpendingChart({ data }: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <section className="flex h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">No spending data to display.</p>
      </section>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="75%"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => (
            <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

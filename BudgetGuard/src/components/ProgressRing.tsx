import { motion } from 'framer-motion'

export type ProgressRingStatus = 'ok' | 'warning' | 'exceeded'

export interface ProgressRingProps {
  progress: number
  status: ProgressRingStatus
  label: string
}

const STATUS_COLORS: Record<ProgressRingStatus, string> = {
  ok: '#059669',
  warning: '#EA580C',
  exceeded: '#DC2626',
}

const VIEWBOX_SIZE = 120
const CENTER = VIEWBOX_SIZE / 2
const RADIUS = 52
const STROKE_WIDTH = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const STATUS_COLOR = STATUS_COLORS

export default function ProgressRing({ progress, status, label }: ProgressRingProps) {
  const strokeColor = STATUS_COLOR[status]
  const fillPercent = Math.min(100, Math.max(0, progress))
  const displayPercent = Math.round(progress)

  return (
    <motion.div
      className="progress-ring"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
        }}
      >
        <svg
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          width="100%"
          height="100%"
          role="img"
          aria-label={`${label}: ${displayPercent}%`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={STROKE_WIDTH}
          />
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{
              strokeDashoffset: CIRCUMFERENCE * (1 - fillPercent / 100),
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <text
            x={CENTER}
            y={CENTER}
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {displayPercent}%
          </text>
        </svg>
      </motion.div>
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-h, #08060d)',
          textAlign: 'center',
          lineHeight: 1.3,
          maxWidth: '100%',
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}

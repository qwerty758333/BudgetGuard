import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { AnimatePresence, motion } from 'framer-motion'

export interface CelebrationProps {
  show: boolean
  badgeName: string
}

const CONFETTI_COLORS = ['#2563EB', '#16A34A', '#EA580C', '#EAB308']
const CELEBRATION_DURATION_MS = 2000

function getWindowSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function Celebration({ show, badgeName }: CelebrationProps) {
  const [active, setActive] = useState(false)
  const [windowSize, setWindowSize] = useState(getWindowSize)

  useEffect(() => {
    const handleResize = () => setWindowSize(getWindowSize())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!show) {
      setActive(false)
      return
    }

    setActive(true)
    const timer = window.setTimeout(() => setActive(false), CELEBRATION_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [show, badgeName])

  if (!show && !active) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {active && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          gravity={0.1}
          recycle={false}
          run={active}
          colors={CONFETTI_COLORS}
        />
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            key={`celebration-${badgeName}`}
            className="fixed left-1/2 top-1/2 max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/90 p-8 text-center shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <p className="text-2xl font-bold text-blue-600">
              🎉 Congratulations! You earned the {badgeName} badge!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

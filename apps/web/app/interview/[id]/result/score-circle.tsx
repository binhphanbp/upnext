/**
 * ScoreCircle — Animated SVG ring showing the overall AI score.
 *
 * Uses Framer Motion's `useMotionValue` + `useSpring` for the
 * count-up animation on mount.
 */
'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface ScoreCircleProps {
  score: number // 0-100
  size?: number
}

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function scoreColor(score: number): { stroke: string; text: string; glow: string } {
  if (score >= 75)
    return {
      stroke: '#10b981', // emerald-500
      text: 'text-emerald-400',
      glow: 'rgba(16,185,129,0.3)',
    }
  if (score >= 50)
    return {
      stroke: '#f59e0b', // amber-500
      text: 'text-amber-400',
      glow: 'rgba(245,158,11,0.3)',
    }
  return {
    stroke: '#ef4444', // red-500
    text: 'text-red-400',
    glow: 'rgba(239,68,68,0.3)',
  }
}

export function ScoreCircle({ score, size = 160 }: ScoreCircleProps) {
  const colors = scoreColor(score)

  const progress = useMotionValue(0)
  const spring = useSpring(progress, { stiffness: 60, damping: 20 })
  const dashOffset = useTransform(
    spring,
    [0, 100],
    [CIRCUMFERENCE, CIRCUMFERENCE * (1 - score / 100)],
  )

  const displayNumber = useMotionValue(0)
  const displaySpring = useSpring(displayNumber, { stiffness: 50, damping: 18 })
  const roundedDisplay = useTransform(displaySpring, (v) => Math.round(v))

  useEffect(() => {
    progress.set(score)
    displayNumber.set(score)
  }, [score, progress, displayNumber])

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          className="-rotate-90"
          style={{ filter: `drop-shadow(0 0 12px ${colors.glow})` }}
        >
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="#27272a"
            strokeWidth="8"
          />
          {/* Animated progress arc */}
          <motion.circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>

        {/* Score number overlay */}
        <div className="absolute flex flex-col items-center">
          <motion.span
            className={`text-4xl font-bold tabular-nums ${colors.text}`}
          >
            {/* Can't render MotionValue directly — use a counter component */}
            <Counter value={score} />
          </motion.span>
          <span className="text-xs text-zinc-500">/ 100</span>
        </div>
      </div>

      <p className="text-sm font-medium text-zinc-400">Overall Score</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Counter — count-up number                                            */
/* ------------------------------------------------------------------ */
function Counter({ value }: { value: number }) {
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 50, damping: 18 })
  const display = useTransform(spring, (v) => String(Math.round(v)))

  useEffect(() => {
    motionVal.set(value)
  }, [value, motionVal])

  return <motion.span>{display}</motion.span>
}

/**
 * Waveform — Framer Motion animated audio visualiser.
 *
 * Renders a row of bars whose heights are driven by live frequency data.
 * When `active` is false the bars idle at a minimal gentle pulse.
 */
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WaveformProps {
  /** Frequency band values from useAudioAnalyser (0–1 each) */
  bars: number[]
  /** Whether the audio source is currently active */
  active: boolean
  /** 'emerald' for AI speaker, 'blue' for user */
  color?: 'emerald' | 'blue'
  className?: string
}

export function Waveform({ bars, active, color = 'emerald', className }: WaveformProps) {
  const barColor =
    color === 'emerald'
      ? 'bg-primary-500'
      : 'bg-blue-400'

  const glowColor =
    color === 'emerald'
      ? 'shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]'
      : 'shadow-[0_0_8px_2px_rgba(96,165,250,0.5)]'

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-[3px]',
        className,
      )}
    >
      {bars.map((value, i) => {
        /* Minimum height so bars are always visible */
        const heightPct = active ? Math.max(0.08, value) : 0.08

        return (
          <motion.span
            key={i}
            className={cn(
              'w-[3px] rounded-full',
              barColor,
              active && value > 0.3 && glowColor,
            )}
            animate={{ scaleY: heightPct * 10 + 0.5 }}
            transition={
              active
                ? { duration: 0.08, ease: 'linear' }
                : {
                    duration: 1.4,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: (i * 0.07) % 0.5,
                  }
            }
            style={{ originY: '50%', height: 32 }}
          />
        )
      })}
    </div>
  )
}

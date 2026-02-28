'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const stats = [
  { value: '12,400+', label: 'Engineers hired' },
  { value: '98,000+', label: 'Mock interviews completed' },
  { value: '4.9 / 5', label: 'Average rating' },
  { value: '< 48 hrs', label: 'Average time to first offer' },
] as const

/* ------------------------------------------------------------------ */
/* Animation variants                                                   */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

/**
 * StatsSection — Client Component (Framer Motion scroll trigger).
 *
 * Displays social-proof numbers in a clean 4-column grid.
 * The dividers are rendered via CSS border to avoid extra elements.
 */
export function StatsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      aria-label="UpNext by the numbers"
      className="border-y border-zinc-800/60 bg-zinc-900/40 py-16 backdrop-blur-sm"
    >
      <motion.div
        className="container-page grid grid-cols-2 gap-px bg-zinc-800/50 overflow-hidden rounded-2xl md:grid-cols-4"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-1.5 bg-zinc-900/80 px-8 py-10 text-center"
          >
            <span className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              {stat.value}
            </span>
            <span className="text-sm text-zinc-500">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

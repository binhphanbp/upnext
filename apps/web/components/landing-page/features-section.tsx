'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BriefcaseBusiness,
  Mic2,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: BriefcaseBusiness,
    label: 'Job Portal',
    headline: 'Curated engineering roles, zero noise',
    description:
      'Browse hand-picked software engineering positions from top-tier companies. Filter by stack, level, and location. Apply directly — no recruiters, no spam.',
    href: '/jobs',
    cta: 'Browse jobs',
    accent: 'group-hover:text-primary-400',
    glow: 'group-hover:shadow-primary-500/15',
  },
  {
    icon: Mic2,
    label: 'AI Mock Interview',
    headline: 'Interview practice that feels real',
    description:
      'Speak freely. Our Gemini-powered AI interviewer asks context-aware follow-ups, just like a real panel interview. Behavioral, technical, and system design — all covered.',
    href: '/interview',
    cta: 'Try a mock session',
    accent: 'group-hover:text-primary-400',
    glow: 'group-hover:shadow-primary-500/15',
  },
  {
    icon: BarChart3,
    label: 'Real-time Feedback',
    headline: 'Know exactly where to improve',
    description:
      'Every answer is scored across communication, technical depth, and structure. Get a detailed breakdown within seconds — not days — so you can iterate fast.',
    href: '/interview',
    cta: 'See a sample report',
    accent: 'group-hover:text-primary-400',
    glow: 'group-hover:shadow-primary-500/15',
  },
] as const

/* ------------------------------------------------------------------ */
/* Animation variants                                                   */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const headingVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

/**
 * FeaturesSection — Client Component.
 *
 * Requires 'use client' solely for Framer Motion's `useInView` hook
 * (scroll-triggered animations). Card hover effects are handled by
 * Framer Motion's `whileHover` for consistent 60fps performance.
 */
export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-80px',
  })

  return (
    <section
      ref={sectionRef}
      aria-labelledby="features-heading"
      className="relative py-24 md:py-32"
    >
      {/* ── Section header ─────────────────────────────────────────── */}
      <motion.div
        className="container-page mb-16 flex flex-col items-center text-center"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <motion.p
          variants={headingVariants}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary-500"
        >
          Everything you need
        </motion.p>
        <motion.h2
          id="features-heading"
          variants={headingVariants}
          className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl"
        >
          One platform.
          <br />
          <span className="text-zinc-500">Three unfair advantages.</span>
        </motion.h2>
        <motion.p
          variants={headingVariants}
          className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          Stop context-switching between job boards, Pramp, and interview prep
          YouTube. UpNext brings it all under one roof.
        </motion.p>
      </motion.div>

      {/* ── Feature cards grid ─────────────────────────────────────── */}
      <motion.div
        className="container-page grid grid-cols-1 gap-5 md:grid-cols-3"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.label}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
              className={[
                'group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60',
                'p-8 backdrop-blur-sm transition-shadow duration-300',
                `hover:border-zinc-700 hover:shadow-xl ${feature.glow}`,
              ].join(' ')}
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/80">
                <Icon
                  className={`h-5 w-5 text-zinc-400 transition-colors duration-200 ${feature.accent}`}
                  aria-hidden="true"
                />
              </div>

              {/* Label tag */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
                {feature.label}
              </p>

              {/* Card headline */}
              <h3 className="mb-3 text-xl font-semibold leading-snug tracking-tight text-zinc-50">
                {feature.headline}
              </h3>

              {/* Description */}
              <p className="flex-1 text-sm leading-relaxed text-zinc-500">
                {feature.description}
              </p>

              {/* CTA link */}
              <Link
                href={feature.href}
                className={[
                  'mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400',
                  'transition-colors duration-150 hover:text-primary-400',
                ].join(' ')}
              >
                {feature.cta}
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>

              {/* Hover glow layer — renders inside the card border */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.07) 0%, transparent 70%)',
                }}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'

/**
 * HeroSection — Server Component.
 *
 * No interactivity here, so we keep it as a pure RSC for best
 * Lighthouse/LCP performance. The animated gradient is done entirely
 * in CSS to avoid any JS cost on the critical path.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center md:py-32"
    >
      {/* ── Background glows ───────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Primary emerald glow — top-center */}
        <div className="absolute left-1/2 top-0 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary-500/10 blur-[120px]" />
        {/* Secondary glow — bottom-left */}
        <div className="absolute -bottom-32 left-0 h-[400px] w-[400px] rounded-full bg-primary-700/8 blur-[100px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ── Badge ──────────────────────────────────────────────────── */}
      <Link
        href="/changelog"
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-primary-500/25 bg-primary-500/8 px-4 py-1.5 text-xs font-medium text-primary-400 transition-all hover:border-primary-500/50 hover:bg-primary-500/12"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-500" />
        </span>
        Now in public beta — See what&apos;s new
        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>

      {/* ── Headline ───────────────────────────────────────────────── */}
      <h1
        id="hero-heading"
        className="max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl xl:text-8xl"
      >
        Land your{' '}
        <span
          className="relative inline-block"
          style={{
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 40%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          dream role
        </span>
        <br className="hidden sm:block" />
        {' '}faster with AI
      </h1>

      {/* ── Subheadline ────────────────────────────────────────────── */}
      <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
        Practice realistic mock interviews powered by Gemini AI, receive
        instant scored feedback, and discover top engineering roles —
        all in one focused workspace.
      </p>

      {/* ── CTAs ───────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/sign-up"
          className="group inline-flex items-center gap-2 rounded-xl bg-primary-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/40 active:scale-[0.97]"
        >
          Start for free
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 px-7 py-3.5 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-50 active:scale-[0.97]"
        >
          Browse open roles
        </Link>
      </div>

      {/* ── Social proof ───────────────────────────────────────────── */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <p className="text-xs tracking-wide text-zinc-600 uppercase">Trusted by engineers at</p>
        {['Google', 'Meta', 'Stripe', 'Vercel', 'Shopify'].map((company) => (
          <span key={company} className="text-sm font-medium text-zinc-500">
            {company}
          </span>
        ))}
      </div>
    </section>
  )
}

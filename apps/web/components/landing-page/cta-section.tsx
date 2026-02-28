import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

/**
 * CtaSection — Server Component.
 *
 * Final conversion block at the bottom of the landing page.
 * Kept intentionally sparse — a lot of whitespace + a single
 * strong CTA converts better than a cluttered section.
 */
export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden py-28 md:py-36"
    >
      {/* Background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/8 blur-[100px]" />
      </div>

      <div className="container-page flex flex-col items-center text-center">
        {/* Icon badge */}
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/30 bg-primary-500/10">
          <Zap className="h-6 w-6 text-primary-400" aria-hidden="true" />
        </div>

        <h2
          id="cta-heading"
          className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl"
        >
          Your next opportunity
          <br />
          <span className="text-zinc-500">is one practice away.</span>
        </h2>

        <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
          Join thousands of engineers who use UpNext to sharpen their skills,
          build confidence, and land the roles they actually want.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 hover:shadow-primary-500/35 active:scale-[0.97]"
          >
            Get started — it&apos;s free
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <p className="mt-5 text-xs text-zinc-600">
          No credit card required. Cancel at any time.
        </p>
      </div>
    </section>
  )
}

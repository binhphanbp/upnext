import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'AI-powered interview practice and job portal. Land your next role faster with real-world mock interviews.',
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <section className="container-page flex flex-col items-center justify-center py-32 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-400">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
        Now in public beta
      </div>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
        Land your{' '}
        <span className="text-gradient-primary">dream job</span>
        <br />
        with AI coaching
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
        Practice with AI-powered mock interviews, get instant feedback, and
        discover top engineering roles — all in one place.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/sign-up"
          className="rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-600 active:scale-95"
        >
          Get started for free
        </Link>
        <Link
          href="/jobs"
          className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-50"
        >
          Browse jobs
        </Link>
      </div>
    </section>
  )
}

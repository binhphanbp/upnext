import { Suspense } from 'react'
import type { Metadata } from 'next'
import { apiFetch } from '@/lib/api'
import type { PaginatedResponse, DbJob } from '@upnext/types'
import { JobCard } from '@/components/jobs/job-card'
import { JobFilters } from '@/components/jobs/job-filters'
import { ChevronLeft, ChevronRight, BriefcaseBusiness } from 'lucide-react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/* Metadata                                                              */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: 'Browse Jobs | UpNext',
  description:
    'Explore hundreds of tech job listings. Filter by location, level, and type — then practice your interview with AI.',
  openGraph: {
    title: 'Browse Jobs | UpNext',
    description: 'Find your next role and ace the interview with AI coaching.',
  },
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */
interface JobsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams

  // Build query string from search params
  const qs = buildQueryString(params)
  const currentPage = Number(params.page ?? 1)

  let result: PaginatedResponse<DbJob> | null = null
  let error: string | null = null

  try {
    result = await apiFetch<PaginatedResponse<DbJob>>(`/jobs?${qs}`, {
      // Revalidate every 60 s; stale while revalidate for instant navigation
      next: { revalidate: 60 },
    } as RequestInit & { next?: { revalidate: number } })
  } catch {
    error = 'Could not load jobs. Please try again later.'
  }

  const jobs = result?.data ?? []
  const total = result?.total ?? 0
  const pageSize = result?.pageSize ?? 12
  const totalPages = Math.ceil(total / pageSize)

  return (
    <main className="container-page py-12">
      {/* Page header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
          <BriefcaseBusiness className="h-4 w-4" />
          <span>Jobs board</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-100">Browse Openings</h1>
        <p className="mt-1 text-zinc-400">
          {total > 0
            ? `${total.toLocaleString()} job${total !== 1 ? 's' : ''} found`
            : 'Showing all available positions'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense>
          <JobFilters />
        </Suspense>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!error && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 py-20 text-center">
          <BriefcaseBusiness className="h-10 w-10 text-zinc-600" />
          <p className="text-zinc-400">No jobs match your current filters.</p>
          <Link
            href="/jobs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
          >
            Clear filters
          </Link>
        </div>
      )}

      {/* Grid */}
      {jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          params={params}
        />
      )}
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */
function buildQueryString(
  params: Record<string, string | string[] | undefined>,
): string {
  const allowed = ['q', 'tags', 'location', 'level', 'jobType', 'page', 'pageSize']
  const qs = new URLSearchParams()
  for (const key of allowed) {
    const value = params[key]
    if (value && typeof value === 'string') qs.set(key, value)
  }
  return qs.toString()
}

/* ------------------------------------------------------------------ */
/* Pagination                                                            */
/* ------------------------------------------------------------------ */
function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number
  totalPages: number
  params: Record<string, string | string[] | undefined>
}) {
  function pageHref(page: number) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v && typeof v === 'string') p.set(k, v)
    }
    p.set('page', String(page))
    return `/jobs?${p.toString()}`
  }

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <PaginationLink
        href={currentPage > 1 ? pageHref(currentPage - 1) : undefined}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationLink>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <PaginationLink
          key={page}
          href={pageHref(page)}
          active={page === currentPage}
        >
          {page}
        </PaginationLink>
      ))}

      <PaginationLink
        href={currentPage < totalPages ? pageHref(currentPage + 1) : undefined}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </nav>
  )
}

function PaginationLink({
  href,
  active,
  children,
  'aria-label': ariaLabel,
}: {
  href?: string
  active?: boolean
  children: React.ReactNode
  'aria-label'?: string
}) {
  const base =
    'flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2 text-sm transition'

  if (!href) {
    return (
      <span
        className={`${base} cursor-default border-zinc-800 text-zinc-700`}
        aria-label={ariaLabel}
      >
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={
        active
          ? `${base} border-primary-500/50 bg-primary-500/10 font-medium text-primary-400`
          : `${base} border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200`
      }
    >
      {children}
    </Link>
  )
}

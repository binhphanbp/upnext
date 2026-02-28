import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin,
  Briefcase,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import type { ApiSuccess, DbJob } from '@upnext/types'
import { SkillTag } from '@/components/jobs/skill-tag'
import { ApplyButton } from './apply-button'

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */
interface PageProps {
  params: Promise<{ id: string }>
}

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */
const LEVEL_LABELS: Record<string, string> = {
  intern: 'Intern',
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead',
  manager: 'Manager',
}

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
}

const LOCATION_LABELS: Record<string, string> = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
}

async function getJob(id: string): Promise<DbJob | null> {
  try {
    const res = await apiFetch<ApiSuccess<DbJob>>(`/jobs/${id}`, {
      next: { revalidate: 300 },
    } as RequestInit & { next?: { revalidate: number } })
    return res.data
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* generateMetadata                                                      */
/* ------------------------------------------------------------------ */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const job = await getJob(id)

  if (!job) {
    return { title: 'Job Not Found | UpNext' }
  }

  const description = job.description
    ? job.description.slice(0, 155).replace(/\n/g, ' ')
    : `${job.title} at ${job.companyName} — apply with AI-powered mock interviews on UpNext.`

  return {
    title: `${job.title} at ${job.companyName} | UpNext`,
    description,
    openGraph: {
      title: `${job.title} — ${job.companyName}`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${job.title} — ${job.companyName}`,
      description,
    },
  }
}

/* ------------------------------------------------------------------ */
/* JSON-LD helper                                                        */
/* ------------------------------------------------------------------ */
function buildJobPostingJsonLd(job: DbJob): Record<string, unknown> {
  const salary = job.salaryRange as {
    min?: number
    max?: number
    currency?: string
  } | null

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description ?? '',
    datePosted: job.createdAt
      ? new Date(job.createdAt).toISOString().split('T')[0]
      : undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName,
    },
    jobLocation:
      job.locationMode === 'remote'
        ? { '@type': 'Place', address: 'Remote' }
        : job.location
          ? { '@type': 'Place', address: job.location }
          : undefined,
    employmentType: job.jobType?.toUpperCase().replace('_', '-'),
    ...(salary?.min || salary?.max
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: salary?.currency ?? 'USD',
            value: {
              '@type': 'QuantitativeValue',
              minValue: salary?.min,
              maxValue: salary?.max,
              unitText: 'YEAR',
            },
          },
        }
      : {}),
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */
export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params
  const job = await getJob(id)

  if (!job) notFound()

  const jsonLd = buildJobPostingJsonLd(job)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container-page py-12">
        {/* Back breadcrumb */}
        <Link
          href="/jobs"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* ---- Main content ---- */}
          <article>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
                {job.title}
              </h1>
              <p className="mt-1 text-lg text-zinc-400">{job.companyName}</p>
            </div>

            {/* Meta pills */}
            <div className="mb-6 flex flex-wrap gap-2 text-sm text-zinc-400">
              {job.location && (
                <MetaBadge icon={<MapPin className="h-3.5 w-3.5" />}>
                  {job.location}
                </MetaBadge>
              )}
              {job.locationMode && (
                <MetaBadge icon={<Briefcase className="h-3.5 w-3.5" />}>
                  {LOCATION_LABELS[job.locationMode] ?? job.locationMode}
                </MetaBadge>
              )}
              {job.level && (
                <MetaBadge icon={<TrendingUp className="h-3.5 w-3.5" />}>
                  {LEVEL_LABELS[job.level] ?? job.level}
                </MetaBadge>
              )}
              {job.jobType && (
                <MetaBadge icon={<Clock className="h-3.5 w-3.5" />}>
                  {TYPE_LABELS[job.jobType] ?? job.jobType}
                </MetaBadge>
              )}
              {job.salaryRange && (
                <MetaBadge icon={<DollarSign className="h-3.5 w-3.5" />}>
                  {formatSalaryRange(job.salaryRange as SalaryRangeData)}
                </MetaBadge>
              )}
              {job.createdAt && (
                <MetaBadge icon={<Calendar className="h-3.5 w-3.5" />}>
                  Posted{' '}
                  {new Date(job.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </MetaBadge>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-semibold text-zinc-100">
                  Job Description
                </h2>
                <div className="prose prose-invert prose-zinc max-w-none text-sm leading-relaxed text-zinc-400">
                  {job.description.split('\n').map((para, i) =>
                    para.trim() ? (
                      <p key={i} className="mb-3">
                        {para}
                      </p>
                    ) : null,
                  )}
                </div>
              </section>
            )}

            {/* Skills / tags */}
            {job.tags && (job.tags as string[]).length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-semibold text-zinc-100">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(job.tags as string[]).map((tag) => (
                    <SkillTag key={tag} label={tag} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ---- Sticky sidebar ---- */}
          <aside className="flex flex-col gap-4">
            <div className="sticky top-24 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <p className="mb-1 text-sm font-medium text-zinc-200">
                Ready to land this role?
              </p>
              <p className="mb-5 text-xs text-zinc-500">
                Practice with an AI mock interviewer tailored to this job
                description, then get instant feedback on your performance.
              </p>

              <ApplyButton jobId={job.id} className="w-full justify-center" />

              {job.status !== 'active' && (
                <p className="mt-3 text-center text-xs text-zinc-600">
                  This listing may no longer be active.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Internal components / helpers                                         */
/* ------------------------------------------------------------------ */
function MetaBadge({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1">
      {icon}
      {children}
    </span>
  )
}

type SalaryRangeData = {
  min?: number
  max?: number
  currency?: string
}

function formatSalaryRange(s: SalaryRangeData): string {
  const currency = s.currency ?? 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)
  if (s.min && s.max) return `${fmt(s.min)} – ${fmt(s.max)}`
  if (s.min) return `From ${fmt(s.min)}`
  if (s.max) return `Up to ${fmt(s.max)}`
  return 'Not specified'
}

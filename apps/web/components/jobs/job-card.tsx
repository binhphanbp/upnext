import Link from 'next/link'
import { MapPin, Briefcase, TrendingUp, Clock, DollarSign } from 'lucide-react'
import type { DbJob } from '@upnext/types'
import { SkillTag } from './skill-tag'

/** Map DB enums to human-readable labels */
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

function formatSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

function timeAgo(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

interface JobCardProps {
  job: DbJob
}

/**
 * JobCard — Card displaying a single job listing.
 * Server Component.
 */
export function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(
    (job.salaryRange as { min?: number } | null)?.min,
    (job.salaryRange as { max?: number } | null)?.max,
  )

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group relative flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg hover:shadow-black/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-zinc-100 transition-colors group-hover:text-primary-400">
            {job.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-zinc-400">
            {job.companyName}
          </p>
        </div>

        {/* Status badge */}
        {job.status === 'active' && (
          <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            Hiring
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        {job.locationMode && (
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {LOCATION_LABELS[job.locationMode] ?? job.locationMode}
          </span>
        )}
        {job.level && (
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {LEVEL_LABELS[job.level] ?? job.level}
          </span>
        )}
        {job.jobType && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {TYPE_LABELS[job.jobType] ?? job.jobType}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1 text-zinc-400">
            <DollarSign className="h-3.5 w-3.5" />
            {salary}
          </span>
        )}
      </div>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(job.tags as string[]).slice(0, 6).map((tag) => (
            <SkillTag key={tag} label={tag} />
          ))}
          {(job.tags as string[]).length > 6 && (
            <span className="inline-flex items-center text-xs text-zinc-500">
              +{(job.tags as string[]).length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs text-zinc-600">
        <span>{timeAgo(job.createdAt!)}</span>
        <span className="text-primary-500 opacity-0 transition-opacity group-hover:opacity-100">
          View details →
        </span>
      </div>
    </Link>
  )
}

'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEVEL_OPTIONS = [
  { value: '', label: 'All levels' },
  { value: 'intern', label: 'Intern' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

const LOCATION_OPTIONS = [
  { value: '', label: 'All locations' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
]

/**
 * JobFilters — URL-driven filter bar for the Jobs board.
 * Client Component — reads and writes URL search params.
 */
export function JobFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  /** Build a new URLSearchParams, overriding the given key. Resets to page 1. */
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // reset to first page on filter change
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams],
  )

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname)
    })
  }, [router, pathname])

  const hasFilters = ['q', 'level', 'jobType', 'location', 'tags'].some(
    (k) => searchParams.get(k),
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
        isPending && 'opacity-60 transition-opacity',
      )}
    >
      {/* Text search */}
      <div className="relative flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          defaultValue={searchParams.get('q') ?? ''}
          placeholder="Search jobs, companies, skills…"
          onChange={(e) => updateParam('q', e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30"
        />
      </div>

      {/* Level */}
      <Select
        value={searchParams.get('level') ?? ''}
        options={LEVEL_OPTIONS}
        onChange={(v) => updateParam('level', v)}
      />

      {/* Job type */}
      <Select
        value={searchParams.get('jobType') ?? ''}
        options={TYPE_OPTIONS}
        onChange={(v) => updateParam('jobType', v)}
      />

      {/* Location mode */}
      <Select
        value={searchParams.get('location') ?? ''}
        options={LOCATION_OPTIONS}
        onChange={(v) => updateParam('location', v)}
      />

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Internal Select                                                       */
/* ------------------------------------------------------------------ */
function Select({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-3 pr-8 text-sm text-zinc-300 outline-none transition focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

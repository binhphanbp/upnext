'use server'

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { apiFetch, ApiError } from '@/lib/api'
import type { ApiSuccess, DbJob, DbJobInsert } from '@upnext/types'

/* ------------------------------------------------------------------ */
/* searchJobs — quick search redirect (from hero / navbar search forms)  */
/* ------------------------------------------------------------------ */

/**
 * Redirect the user to the jobs listing page with the search query applied.
 * Suitable as a `<form action={searchJobs}>` handler.
 */
export async function searchJobs(formData: FormData): Promise<void> {
  const q = (formData.get('q') as string | null)?.trim()

  if (!q) {
    redirect('/jobs')
  }

  const qs = new URLSearchParams({ q }).toString()
  redirect(`/jobs?${qs}`)
}

/* ------------------------------------------------------------------ */
/* createJob — authenticated server action                              */
/* ------------------------------------------------------------------ */

export type CreateJobState =
  | { status: 'idle' }
  | { status: 'success'; jobId: string }
  | { status: 'error'; message: string }

/**
 * Create a new job posting.
 * Requires the user to be signed in (checked via Clerk server-side auth).
 *
 * Intended for use with `useFormState` / `useActionState` in a Client Component.
 */
export async function createJob(
  _prev: CreateJobState,
  formData: FormData,
): Promise<CreateJobState> {
  const { getToken, userId } = await auth()

  if (!userId) {
    return { status: 'error', message: 'You must be signed in to post a job.' }
  }

  const token = await getToken()

  // --- Parse & validate form data ---
  const title = (formData.get('title') as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim()
  const companyName = (formData.get('companyName') as string | null)?.trim()
  const location = (formData.get('location') as string | null)?.trim() || null
  const locationMode = formData.get('locationMode') as
    | DbJobInsert['locationMode']
    | null
  const level = formData.get('level') as DbJobInsert['level'] | null
  const jobType = formData.get('jobType') as DbJobInsert['jobType'] | null
  const tagsRaw = (formData.get('tags') as string | null)?.trim()
  const tags = tagsRaw
    ? tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const salaryMinRaw = formData.get('salaryMin')
  const salaryMaxRaw = formData.get('salaryMax')
  const salaryMin = salaryMinRaw ? Number(salaryMinRaw) : null
  const salaryMax = salaryMaxRaw ? Number(salaryMaxRaw) : null

  if (!title) return { status: 'error', message: 'Job title is required.' }
  if (!companyName)
    return { status: 'error', message: 'Company name is required.' }

  const payload: Partial<DbJobInsert> = {
    title,
    description,
    companyName,
    location,
    locationMode,
    level,
    jobType,
    tags,
    salaryRange:
      salaryMin || salaryMax ? { min: salaryMin, max: salaryMax } : null,
  }

  try {
    const res = await apiFetch<ApiSuccess<DbJob>>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
      token: token ?? undefined,
    })

    return { status: 'success', jobId: res.data.id }
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as
        | { message?: string | string[] }
        | null

      const message =
        typeof body?.message === 'string'
          ? body.message
          : Array.isArray(body?.message)
            ? body.message.join(', ')
            : `Server error (${err.status})`

      return { status: 'error', message }
    }

    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}

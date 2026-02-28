/**
 * /interview/[id] — Virtual Interview Room
 *
 * Server Component:
 *  1. Verifies auth (redirect → sign-in if not authenticated).
 *  2. Fetches job details from the NestJS API.
 *  3. Renders the client-side <InterviewRoom> with hydrated job data.
 */
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import type { ApiSuccess, DbJob } from '@upnext/types'
import { InterviewRoom } from './interview-room'

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

interface PageProps {
  params: Promise<{ id: string }>
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                         */
/* ------------------------------------------------------------------ */

async function fetchJob(id: string): Promise<DbJob | null> {
  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
  ).replace(/\/$/, '')

  try {
    const res = await fetch(`${apiBase}/jobs/${id}`, {
      next: { revalidate: 300 },
    } as RequestInit & { next?: unknown })

    if (!res.ok) return null

    const json: ApiSuccess<DbJob> = await res.json()
    return json.data ?? (json as unknown as DbJob)
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* Metadata                                                              */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const job = await fetchJob(id)

  if (!job) return { title: 'Interview Room | UpNext' }

  return {
    title: `Mock Interview: ${job.title} at ${job.companyName} | UpNext`,
    description: `Practice your AI-powered mock interview for the ${job.title} role at ${job.companyName}. Get instant feedback.`,
    robots: { index: false, follow: false }, // private session page
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default async function InterviewPage({ params }: PageProps) {
  const { id } = await params

  /* Guard: must be authenticated */
  const { userId } = await auth()
  if (!userId) {
    redirect(`/sign-in?redirect_url=/interview/${id}`)
  }

  /* Fetch job */
  const job = await fetchJob(id)
  if (!job) notFound()

  return (
    <InterviewRoom
      jobData={{
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        description: job.description,
        tags: job.tags as string[] | null,
        level: job.level,
        jobType: job.jobType,
        location: job.location,
        locationMode: job.locationMode,
      }}
    />
  )
}

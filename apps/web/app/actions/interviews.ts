'use server'

import { auth } from '@clerk/nextjs/server'
import { apiFetch, ApiError } from '@/lib/api'
import type { DbInterview, AiFeedback } from '@upnext/types'

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

export interface TranscriptMessage {
  role: 'ai' | 'user'
  content: string
}

export interface EvaluationResult {
  id: string
  aiScore: number
  aiFeedback: AiFeedback
  status: string
}

export interface InterviewWithJob {
  interview: DbInterview
  job: {
    id: string
    title: string
    companyName: string
    description?: string | null
    tags?: string[] | null
    level?: string | null
  } | null
}

/* ------------------------------------------------------------------ */
/* createInterview — called when interview session begins              */
/* ------------------------------------------------------------------ */

export async function createInterview(
  jobId: string,
): Promise<{ id: string } | null> {
  const { getToken, userId } = await auth()
  if (!userId) return null

  const token = await getToken()

  try {
    const res = await apiFetch<{ data: { id: string; status: string } }>(
      '/interviews',
      {
        method: 'POST',
        body: JSON.stringify({ jobId }),
        token: token ?? undefined,
      },
    )
    return { id: res.data.id }
  } catch (err) {
    console.error('[createInterview] Error:', err)
    return null
  }
}

/* ------------------------------------------------------------------ */
/* evaluateInterview — called after interview ends                     */
/* ------------------------------------------------------------------ */

export async function evaluateInterview(
  interviewId: string,
  transcript: TranscriptMessage[],
): Promise<{ success: true; score: number } | { success: false; error: string }> {
  const { getToken, userId } = await auth()

  if (!userId) {
    return { success: false, error: 'Not authenticated' }
  }

  const token = await getToken()

  // Filter out system messages
  const cleanTranscript = transcript.filter(
    (m) => !m.content.startsWith('[INTERVIEW_START]'),
  )

  if (cleanTranscript.length < 2) {
    return { success: false, error: 'Transcript too short to evaluate' }
  }

  try {
    const res = await apiFetch<{ data: DbInterview }>(
      `/interviews/${interviewId}/evaluate`,
      {
        method: 'POST',
        body: JSON.stringify({ transcript: cleanTranscript }),
        token: token ?? undefined,
      },
    )

    return {
      success: true,
      score: res.data.aiScore ?? 0,
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        error: `Evaluation failed (${err.status}): ${JSON.stringify(err.body)}`,
      }
    }
    return { success: false, error: 'Unexpected error during evaluation' }
  }
}

/* ------------------------------------------------------------------ */
/* getInterviewResult — fetches result for the result page            */
/* ------------------------------------------------------------------ */

export async function getInterviewResult(
  interviewId: string,
): Promise<InterviewWithJob | null> {
  const { getToken, userId } = await auth()
  if (!userId) return null

  const token = await getToken()

  try {
    const res = await apiFetch<{ data: InterviewWithJob }>(
      `/interviews/${interviewId}/result`,
      {
        token: token ?? undefined,
        next: { revalidate: 60 },
      } as RequestInit & { next?: unknown },
    )
    return res.data
  } catch {
    return null
  }
}

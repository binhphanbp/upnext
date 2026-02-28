/**
 * POST /api/interview/chat
 *
 * Streaming interview AI endpoint powered by Gemini 1.5 Flash.
 *
 * Request body (JSON):
 *   {
 *     jobId: string,
 *     messages: Array<{ role: 'user' | 'assistant', content: string }>,
 *     // Optional — caller can pass job data directly to avoid an extra fetch
 *     jobData?: { title: string; companyName: string; description?: string; tags?: string[]; level?: string }
 *   }
 *
 * Responds with a Vercel AI SDK data-stream (ReadableStream).
 */
import { google } from '@ai-sdk/google'
import { streamText, convertToCoreMessages } from 'ai'
import { auth, currentUser } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

interface JobData {
  title: string
  companyName: string
  description?: string | null
  tags?: string[] | null
  level?: string | null
  jobType?: string | null
  location?: string | null
  locationMode?: string | null
}

function buildSystemPrompt(job: JobData, candidateName: string): string {
  const skills = job.tags?.length ? job.tags.join(', ') : 'Not specified'
  const level = job.level ?? 'Not specified'

  return `You are an expert technical interviewer conducting a realistic mock job interview for UpNext, an AI-powered career platform.

## Role Details
- **Position:** ${job.title}
- **Company:** ${job.companyName}
- **Level:** ${level}
- **Required Skills:** ${skills}
${job.description ? `\n## Job Description\n${job.description}\n` : ''}

## Candidate
- **Name:** ${candidateName}

## Interview Instructions
1. Begin with a brief, friendly introduction (2-3 sentences): mention the role, company, and your name ("Alex").
2. Ask **one question at a time**. Wait for the candidate's answer before asking the next.
3. After each answer, give a **brief acknowledgment** (1 sentence, e.g., "Great insight.") then transition naturally to the next question.
4. Tailor questions to the job description and required skills.
5. Mix question types: technical depth, behavioural (STAR method), situational, and motivation questions.
6. Keep each response concise — max 3 sentences for transitions, max 2 sentences for acknowledgments.
7. After 5–6 questions, wrap up warmly and tell the candidate that a detailed feedback report will be available shortly.
8. Never break character. Never reveal you are an AI unless directly asked.
9. Use professional but approachable language.

Begin the interview now.`
}

/* ------------------------------------------------------------------ */
/* Route handler                                                         */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  /* Auth check */
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    jobId?: string
    messages?: { role: string; content: string }[]
    jobData?: JobData
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { jobId, messages = [], jobData: inlineJobData } = body

  if (!jobId) {
    return Response.json({ error: 'jobId is required' }, { status: 400 })
  }

  /* Resolve job data — use inlined data or fetch from NestJS */
  let job: JobData

  if (inlineJobData) {
    job = inlineJobData
  } else {
    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
    ).replace(/\/$/, '')

    const jobRes = await fetch(`${apiBase}/jobs/${jobId}`, {
      next: { revalidate: 300 },
    } as RequestInit & { next?: unknown })

    if (!jobRes.ok) {
      return Response.json(
        { error: `Failed to fetch job (${jobRes.status})` },
        { status: 502 },
      )
    }

    const jobJson = await jobRes.json()
    // NestJS returns { data: DbJob } via ApiSuccess<T>
    job = jobJson.data ?? jobJson
  }

  /* Resolve candidate name */
  let candidateName = 'the candidate'
  try {
    const user = await currentUser()
    if (user) {
      candidateName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.emailAddresses[0]?.emailAddress ||
        'the candidate'
    }
  } catch {
    // non-fatal — proceed with generic name
  }

  const systemPrompt = buildSystemPrompt(job, candidateName)

  /* Stream Gemini response */
  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: systemPrompt,
    messages: convertToCoreMessages(
      messages as Parameters<typeof convertToCoreMessages>[0],
    ),
    maxTokens: 512,
    temperature: 0.7,
  })

  return result.toDataStreamResponse()
}

/**
 * /interview/[id]/result — Post-interview AI feedback page.
 *
 * Server Component. Reads interview + job data, then renders
 * score circle, radar chart, strengths/weaknesses, and per-question
 * breakdown.
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Briefcase, Building2, Calendar } from 'lucide-react'
import { getInterviewResult } from '@/app/actions/interviews'
import type { AiFeedback } from '@upnext/types'
import { ScoreCircle } from './score-circle'
import { SkillRadar } from './skill-radar'
import { FeedbackSection } from './feedback-section'
import { QuestionCard } from './question-card'

/* ------------------------------------------------------------------ */
/* Metadata                                                              */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getInterviewResult(id)
  const title = result?.job?.title ?? 'Interview'
  return {
    title: `Result — ${title} | UpNext`,
    description: 'Your AI-generated interview feedback report.',
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default async function InterviewResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getInterviewResult(id)

  if (!result) return notFound()

  const { interview, job } = result
  const fb = interview.aiFeedback as AiFeedback | null

  /* ---- Not ready states ---- */
  if (interview.status === 'processing') {
    return <PendingState />
  }

  if (interview.status === 'failed' || !fb) {
    return <FailedState interviewId={id} />
  }

  /* ---- Full result ---- */
  const score = interview.aiScore ?? 0
  const completedAt = interview.updatedAt
    ? new Date(interview.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Just now'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── Top header ── */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {job && (
              <>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                  {job.title}
                </span>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Building2 className="h-3.5 w-3.5 text-zinc-600" />
                  {job.companyName}
                </span>
                <span className="text-zinc-700">·</span>
              </>
            )}
            <span className="flex items-center gap-1 text-zinc-500">
              <Calendar className="h-3.5 w-3.5 text-zinc-600" />
              {completedAt}
            </span>
          </div>
          <RecommendationBadge recommendation={fb.recommendation} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-5 py-10">
        {/* ── Section 1: Overview ── */}
        <section className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <ScoreCircle score={score} size={180} />

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-zinc-100">Overall Summary</h2>
              <p className="leading-relaxed text-zinc-400">{fb.overallSummary}</p>
            </div>

            {/* Dimension score bars */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                { label: 'Technical', score: fb.technicalScore },
                { label: 'Communication', score: fb.communicationScore },
                { label: 'Behavioral', score: fb.behavioralScore },
                { label: 'Problem Solving', score: fb.problemSolvingScore },
                { label: 'Domain Expertise', score: fb.domainExpertiseScore },
              ].map(({ label, score: dimScore }) => (
                <ScoreBar key={label} label={label} score={dimScore} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 2: Radar chart ── */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="mb-4 text-base font-semibold text-zinc-200">Skill Breakdown</h2>
          <SkillRadar
            communicationScore={fb.communicationScore}
            technicalScore={fb.technicalScore}
            behavioralScore={fb.behavioralScore}
            problemSolvingScore={fb.problemSolvingScore}
            domainExpertiseScore={fb.domainExpertiseScore}
          />
        </section>

        {/* ── Section 3: Strengths / Weaknesses / Improvements ── */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-zinc-200">Detailed Feedback</h2>
          <FeedbackSection
            strengths={fb.strengths ?? []}
            weaknesses={fb.weaknesses ?? []}
            improvements={fb.improvements ?? []}
          />
        </section>

        {/* ── Section 4: Per-question breakdown ── */}
        {fb.items && fb.items.length > 0 && (
          <section>
            <h2 className="mb-4 text-base font-semibold text-zinc-200">
              Question Breakdown
            </h2>
            <div className="space-y-3">
              {fb.items.map((item, i) => (
                <QuestionCard key={i} item={item} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Footer CTA ── */}
        <div className="flex items-center justify-center gap-4 pb-6">
          <Link
            href="/jobs"
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
          >
            Browse More Jobs
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] transition hover:bg-primary-400"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color =
    pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium text-zinc-300">{score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const RECOMMENDATION_CONFIG = {
  strong_hire: {
    label: 'Strong Hire',
    cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  hire: {
    label: 'Hire',
    cls: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  no_hire: {
    label: 'Consider Further',
    cls: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  strong_no_hire: {
    label: 'Not Recommended',
    cls: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
} as const

function RecommendationBadge({
  recommendation,
}: {
  recommendation: AiFeedback['recommendation']
}) {
  const cfg = RECOMMENDATION_CONFIG[recommendation] ?? RECOMMENDATION_CONFIG.no_hire
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  )
}

function PendingState() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-zinc-950">
      <div className="flex max-w-sm flex-col items-center gap-5 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-primary-500" />
        <h2 className="text-lg font-semibold text-zinc-100">Generating your report…</h2>
        <p className="text-sm text-zinc-500">
          Your AI feedback is being prepared. This page will refresh automatically.
        </p>
        <meta httpEquiv="refresh" content="5" />
      </div>
    </div>
  )
}

function FailedState({ interviewId }: { interviewId: string }) {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-zinc-950">
      <div className="flex max-w-sm flex-col items-center gap-5 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30 text-2xl">
          ✗
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">Evaluation Failed</h2>
        <p className="text-sm text-zinc-500">
          We couldn&apos;t generate your feedback for interview{' '}
          <code className="text-zinc-400">{interviewId.slice(0, 8)}</code>. Please
          contact support if this persists.
        </p>
        <Link
          href="/dashboard"
          className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

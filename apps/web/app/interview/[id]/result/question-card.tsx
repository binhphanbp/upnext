/**
 * QuestionCard — Per-question breakdown accordion.
 * Shows: score badge, user's answer, AI strengths & improvements, model answer.
 * Server Component (uses native <details>/<summary>).
 */
import { cn } from '@/lib/utils'
import type { AiFeedbackItem } from '@upnext/types'

interface QuestionCardProps {
  item: AiFeedbackItem
  index: number
}

function scoreBadge(score: number) {
  if (score >= 8) return { label: `${score}/10`, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
  if (score >= 6) return { label: `${score}/10`, cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
  return { label: `${score}/10`, cls: 'bg-red-500/15 text-red-400 border-red-500/30' }
}

export function QuestionCard({ item, index }: QuestionCardProps) {
  const badge = scoreBadge(item.scoreOutOf10)

  return (
    <details className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 open:border-zinc-700">
      <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
        {/* Question number */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">
          Q{index + 1}
        </span>

        {/* Question text */}
        <span className="flex-1 text-sm font-medium text-zinc-200 leading-relaxed">
          {item.question}
        </span>

        {/* Score badge */}
        <span
          className={cn(
            'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            badge.cls,
          )}
        >
          {badge.label}
        </span>

        {/* Chevron */}
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      {/* Expanded content */}
      <div className="border-t border-zinc-800 px-5 py-4 space-y-4">
        {/* User's answer */}
        {item.answer && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Your Answer
            </p>
            <p className="rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-300">
              {item.answer}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Strengths */}
          {item.strengths && item.strengths.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">
                What went well
              </p>
              <ul className="space-y-1">
                {item.strengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="mt-1 text-emerald-500">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {item.improvements && item.improvements.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-500">
                How to improve
              </p>
              <ul className="space-y-1">
                {item.improvements.map((imp: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="mt-1 text-amber-500">↗</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Model answer */}
        {item.modelAnswer && (
          <details className="rounded-xl border border-zinc-800">
            <summary className="cursor-pointer px-4 py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-400 [&::-webkit-details-marker]:hidden">
              View model answer ▸
            </summary>
            <div className="border-t border-zinc-800 px-4 py-3">
              <p className="text-sm leading-relaxed text-zinc-400">{item.modelAnswer}</p>
            </div>
          </details>
        )}
      </div>
    </details>
  )
}

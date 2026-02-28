/**
 * FeedbackSection — 3-column grid: Strengths / Weaknesses / Improvements.
 * Server Component.
 */
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react'

interface FeedbackSectionProps {
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
}

export function FeedbackSection({
  strengths,
  weaknesses,
  improvements,
}: FeedbackSectionProps) {
  const columns = [
    {
      title: 'Strengths',
      icon: <CheckCircle2 className="h-4 w-4" />,
      items: strengths,
      colorClass: 'border-emerald-500/20 bg-emerald-500/5',
      headerClass: 'text-emerald-400',
      bulletClass: 'text-emerald-500',
    },
    {
      title: 'Weaknesses',
      icon: <XCircle className="h-4 w-4" />,
      items: weaknesses,
      colorClass: 'border-red-500/20 bg-red-500/5',
      headerClass: 'text-red-400',
      bulletClass: 'text-red-500',
    },
    {
      title: 'Areas to Improve',
      icon: <TrendingUp className="h-4 w-4" />,
      items: improvements,
      colorClass: 'border-amber-500/20 bg-amber-500/5',
      headerClass: 'text-amber-400',
      bulletClass: 'text-amber-500',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {columns.map((col) => (
        <div
          key={col.title}
          className={`rounded-2xl border p-5 ${col.colorClass}`}
        >
          <div className={`mb-4 flex items-center gap-2 font-semibold ${col.headerClass}`}>
            {col.icon}
            {col.title}
          </div>
          <ul className="space-y-2">
            {col.items.length > 0 ? (
              col.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className={`mt-1 shrink-0 ${col.bulletClass}`}>▸</span>
                  {item}
                </li>
              ))
            ) : (
              <li className="text-sm italic text-zinc-600">Nothing noted.</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  )
}

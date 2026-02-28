import { cn } from '@/lib/utils'

interface SkillTagProps {
  label: string
  className?: string
}

/**
 * SkillTag — Pill badge for a single job skill / tag.
 * Server Component.
 */
export function SkillTag({ label, className }: SkillTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-primary-500/20',
        'bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-400',
        'transition-colors hover:border-primary-500/40 hover:bg-primary-500/20',
        className,
      )}
    >
      {label}
    </span>
  )
}

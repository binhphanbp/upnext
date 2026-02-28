import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — Merge Tailwind CSS classes safely.
 * Combines clsx (conditional class logic) with tailwind-merge (deduplication).
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Mic2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ApplyButtonProps {
  jobId: string
  className?: string
}

/**
 * ApplyButton — Auth-gated "Start AI Interview" CTA.
 *
 * - Signed-out users are redirected to /sign-in with a redirect_url
 *   so they land back on this job page after signing in.
 * - Signed-in users are redirected to /interview?jobId=<id>.
 *
 * Client Component.
 */
export function ApplyButton({ jobId, className }: ApplyButtonProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)

    if (!isSignedIn) {
      const redirectUrl = encodeURIComponent(`/jobs/${jobId}`)
      router.push(`/sign-in?redirect_url=${redirectUrl}`)
      return
    }

    router.push(`/interview?jobId=${jobId}`)
  }

  const disabled = !isLoaded || loading

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-xl',
        'bg-primary-500 px-6 py-3 text-sm font-semibold text-white',
        'shadow-[0_0_24px_rgba(16,185,129,0.25)]',
        'transition hover:bg-primary-400 hover:shadow-[0_0_32px_rgba(16,185,129,0.35)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mic2 className="h-4 w-4" />
      )}
      Start AI Interview
    </button>
  )
}

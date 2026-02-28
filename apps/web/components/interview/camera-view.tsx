/**
 * CameraView — Candidate video feed with permission error handling.
 *
 * Shows the live <video> element inside an Emerald-bordered frame when
 * a stream is active, or an appropriate message/icon otherwise.
 */
'use client'

import { useEffect } from 'react'
import { VideoOff, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaPermissionState } from '@/hooks/use-media-stream'

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  permissionState: MediaPermissionState
  errorMessage: string | null
  isVideoActive: boolean
  className?: string
}

export function CameraView({
  videoRef,
  permissionState,
  errorMessage,
  isVideoActive,
  className,
}: CameraViewProps) {
  /* Mirror the video feed (selfie view) */
  useEffect(() => {
    const el = videoRef.current
    if (el) el.style.transform = 'scaleX(-1)'
  }, [videoRef])

  const isGranted = permissionState === 'granted'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-zinc-900',
        isGranted && isVideoActive
          ? 'border-primary-500/40 shadow-[0_0_32px_rgba(16,185,129,0.15)]'
          : 'border-zinc-800',
        className,
      )}
    >
      {/* Video element — always mounted so the ref is stable */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={cn(
          'h-full w-full object-cover',
          (!isGranted || !isVideoActive) && 'invisible',
        )}
      />

      {/* Overlay states */}
      {permissionState === 'requesting' && (
        <Overlay>
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
          <p className="text-sm text-zinc-400">Requesting camera access…</p>
        </Overlay>
      )}

      {(permissionState === 'denied' || permissionState === 'error') && (
        <Overlay>
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="max-w-xs text-center text-sm text-zinc-300">
            {errorMessage}
          </p>
        </Overlay>
      )}

      {permissionState === 'idle' && (
        <Overlay>
          <VideoOff className="h-8 w-8 text-zinc-600" />
          <p className="text-sm text-zinc-500">Camera not started</p>
        </Overlay>
      )}

      {isGranted && !isVideoActive && (
        <Overlay>
          <VideoOff className="h-8 w-8 text-zinc-400" />
          <p className="text-sm text-zinc-400">Camera paused</p>
        </Overlay>
      )}

      {/* Corner name label */}
      {isGranted && (
        <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-zinc-200 backdrop-blur-sm">
          You
        </div>
      )}
    </div>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/80">
      {children}
    </div>
  )
}

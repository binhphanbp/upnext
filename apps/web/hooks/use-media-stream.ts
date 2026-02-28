/**
 * use-media-stream.ts
 *
 * Manages camera + microphone access.
 * Gracefully handles permission denial, device errors, and cleanup.
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type MediaPermissionState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

export interface UseMediaStreamReturn {
  /** Attach to <video> element */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** The raw MediaStream (for audio analysis) */
  stream: MediaStream | null
  permissionState: MediaPermissionState
  /** Human-readable error message if state === 'denied' | 'error' */
  errorMessage: string | null
  /** Request camera + mic access and start streaming */
  startStream: () => Promise<void>
  /** Stop all tracks and release hardware */
  stopStream: () => void
  /** Whether video is currently active */
  isVideoActive: boolean
  /** Whether audio is currently active */
  isAudioActive: boolean
  /** Toggle video track on/off without releasing the stream */
  toggleVideo: () => void
  /** Toggle audio track on/off without releasing the stream */
  toggleAudio: () => void
}

export function useMediaStream(): UseMediaStreamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionState, setPermissionState] =
    useState<MediaPermissionState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isVideoActive, setIsVideoActive] = useState(true)
  const [isAudioActive, setIsAudioActive] = useState(true)

  const startStream = useCallback(async () => {
    setPermissionState('requesting')
    setErrorMessage(null)

    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 },
      })

      streamRef.current = ms
      setStream(ms)
      setPermissionState('granted')
      setIsVideoActive(true)
      setIsAudioActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = ms
      }
    } catch (err) {
      const e = err as DOMException

      if (
        e.name === 'NotAllowedError' ||
        e.name === 'PermissionDeniedError'
      ) {
        setPermissionState('denied')
        setErrorMessage(
          'Camera and microphone access was denied. Please allow access in your browser settings and reload the page.',
        )
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setPermissionState('error')
        setErrorMessage(
          'No camera or microphone was found on this device. Please connect a device and try again.',
        )
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        setPermissionState('error')
        setErrorMessage(
          'Your camera or microphone is in use by another application. Close other apps and try again.',
        )
      } else {
        setPermissionState('error')
        setErrorMessage(`Could not access media devices: ${e.message}`)
      }
    }
  }, [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStream(null)
    setPermissionState('idle')
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const toggleVideo = useCallback(() => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setIsVideoActive((prev) => !prev)
  }, [])

  const toggleAudio = useCallback(() => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setIsAudioActive((prev) => !prev)
  }, [])

  /* Attach stream to video element whenever stream ref changes */
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  /* Cleanup on unmount */
  useEffect(() => stopStream, [stopStream])

  return {
    videoRef,
    stream,
    permissionState,
    errorMessage,
    startStream,
    stopStream,
    isVideoActive,
    isAudioActive,
    toggleVideo,
    toggleAudio,
  }
}

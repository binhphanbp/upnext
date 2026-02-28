/**
 * use-speech-recognition.ts
 *
 * STT (Speech-to-Text) hook using the browser's built-in Web Speech API.
 *
 * This serves as a zero-cost simulation layer. For production accuracy,
 * swap the implementation with a Deepgram / AssemblyAI API call while
 * keeping the same interface.
 *
 * Compatibility: Chrome, Edge (full), Safari (partial), Firefox (unsupported).
 * The hook gracefully degrades — `isSupported` is false on unsupported browsers
 * and all functions become no-ops.
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

export interface UseSpeechRecognitionReturn {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

// The Web Speech API types are not fully covered by @types/dom; extend here
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

/* ------------------------------------------------------------------ */
/* Hook                                                                  */
/* ------------------------------------------------------------------ */

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  /* Detect support on mount (client-only) */
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      (!!window.SpeechRecognition || !!window.webkitSpeechRecognition)
    setIsSupported(supported)
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result?.isFinal) {
          final += result[0]?.transcript ?? ''
        } else {
          interim += result?.[0]?.transcript ?? ''
        }
      }

      if (final) setTranscript((prev) => prev + final)
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' is common and not an error — silently ignore
      if (event.error !== 'no-speech') {
        console.warn('[SpeechRecognition] Error:', event.error, event.message)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isSupported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}

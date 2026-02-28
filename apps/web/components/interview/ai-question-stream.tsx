/**
 * AiQuestionStream — Displays the AI's current question with a typewriter effect.
 *
 * - While streaming: text appears character-by-character; cursor blinks.
 * - When idle: shows the last completed AI question from the store.
 * - Uses a simple interval + substring trick for the typewriter animation
 *   so the component stays decoupled from the raw SSE/ReadableStream.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AiQuestionStreamProps {
  /** The full text to display (updated as stream chunks arrive) */
  fullText: string
  /** True while chunks are still arriving */
  isStreaming: boolean
  className?: string
}

export function AiQuestionStream({
  fullText,
  isStreaming,
  className,
}: AiQuestionStreamProps) {
  /**
   * We keep a local `displayed` state that lags behind `fullText` to create
   * the typewriter illusion even though chunks arrive unevenly.
   */
  const [displayed, setDisplayed] = useState('')
  const targetRef = useRef(fullText)

  useEffect(() => {
    targetRef.current = fullText
  }, [fullText])

  /* Typewriter loop: advance one char every ~18 ms */
  useEffect(() => {
    if (!fullText) {
      setDisplayed('')
      return
    }

    let idx = displayed.length

    const id = setInterval(() => {
      if (idx >= targetRef.current.length) {
        clearInterval(id)
        return
      }
      idx++
      setDisplayed(targetRef.current.slice(0, idx))
    }, 18)

    return () => clearInterval(id)
    // We intentionally only re-run when `fullText` grows (new question starts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText])

  const showCursor = isStreaming || displayed.length < fullText.length

  if (!fullText) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={fullText.slice(0, 20)} // re-animate on new question
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative rounded-2xl border border-primary-500/20 bg-primary-500/5 p-6',
          className,
        )}
      >
        {/* AI avatar chip */}
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/20 ring-1 ring-primary-500/30">
            <Bot className="h-3.5 w-3.5 text-primary-400" />
          </span>
          <span className="text-xs font-medium text-primary-400">
            AI Interviewer
          </span>
        </div>

        {/* Question text */}
        <p className="text-base leading-relaxed text-zinc-200">
          {displayed}
          {showCursor && (
            <motion.span
              className="ml-0.5 inline-block h-[1em] w-[2px] rounded-sm bg-primary-400 align-text-bottom"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'steps(2)' }}
            />
          )}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * InterviewControls — Bottom control bar for the interview room.
 *
 * Provides: mic toggle, camera toggle, submit answer, end interview.
 * Also shows the user's text answer input as a fallback for those who
 * cannot/prefer not to use voice.
 */
'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  SendHorizonal,
  PhoneOff,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterviewPhase } from '@/store/interview-store'

interface InterviewControlsProps {
  phase: InterviewPhase
  isAudioActive: boolean
  isVideoActive: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  /** Called with the typed/spoken answer text */
  onSubmitAnswer: (answer: string) => void
  onEndInterview: () => void
}

export function InterviewControls({
  phase,
  isAudioActive,
  isVideoActive,
  onToggleAudio,
  onToggleVideo,
  onSubmitAnswer,
  onEndInterview,
}: InterviewControlsProps) {
  const [answer, setAnswer] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canAnswer = phase === 'user_answering'
  const isProcessing = phase === 'processing'
  const isAiSpeaking = phase === 'ai_speaking'

  function handleSubmit() {
    const text = answer.trim()
    if (!text || !canAnswer) return
    onSubmitAnswer(text)
    setAnswer('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  /* Auto-grow textarea */
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAnswer(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Answer textarea — only shown when user should answer */}
      <AnimatePresence>
        {(canAnswer || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={!canAnswer}
              placeholder="Type your answer here… (Ctrl + Enter to submit)"
              rows={3}
              className={cn(
                'w-full resize-none rounded-xl border bg-zinc-900/80 px-4 py-3 pr-14',
                'text-sm text-zinc-200 placeholder-zinc-600 outline-none',
                'transition focus:ring-1',
                canAnswer
                  ? 'border-zinc-700 focus:border-primary-500/50 focus:ring-primary-500/30'
                  : 'border-zinc-800 opacity-50',
              )}
            />
            {canAnswer && (
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className={cn(
                  'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg',
                  'transition',
                  answer.trim()
                    ? 'bg-primary-500 text-white hover:bg-primary-400'
                    : 'bg-zinc-800 text-zinc-600',
                )}
                title="Submit answer (Ctrl+Enter)"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </button>
            )}
            <p className="mt-1 text-right text-xs text-zinc-600">
              Ctrl + Enter to submit
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon controls row */}
      <div className="flex items-center justify-between">
        {/* Left: media toggles */}
        <div className="flex items-center gap-2">
          <ControlButton
            onClick={onToggleAudio}
            active={isAudioActive}
            activeIcon={<Mic className="h-4 w-4" />}
            inactiveIcon={<MicOff className="h-4 w-4" />}
            inactiveClass="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
            title={isAudioActive ? 'Mute microphone' : 'Unmute microphone'}
          />
          <ControlButton
            onClick={onToggleVideo}
            active={isVideoActive}
            activeIcon={<Video className="h-4 w-4" />}
            inactiveIcon={<VideoOff className="h-4 w-4" />}
            inactiveClass="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
            title={isVideoActive ? 'Turn off camera' : 'Turn on camera'}
          />
        </div>

        {/* Centre: status label */}
        <StatusPill phase={phase} />

        {/* Right: end interview */}
        <button
          onClick={onEndInterview}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
          title="End interview"
        >
          <PhoneOff className="h-4 w-4" />
          End
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function ControlButton({
  onClick,
  active,
  activeIcon,
  inactiveIcon,
  inactiveClass,
  title,
}: {
  onClick: () => void
  active: boolean
  activeIcon: React.ReactNode
  inactiveIcon: React.ReactNode
  inactiveClass: string
  title: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl border transition',
        active
          ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700'
          : inactiveClass,
      )}
    >
      {active ? activeIcon : inactiveIcon}
    </button>
  )
}

function StatusPill({ phase }: { phase: InterviewPhase }) {
  const configs: Partial<Record<InterviewPhase, { label: string; color: string }>> =
    {
      connecting: { label: 'Setting up…', color: 'text-zinc-400' },
      ai_speaking: { label: 'AI is speaking', color: 'text-primary-400' },
      user_answering: { label: 'Your turn', color: 'text-blue-400' },
      processing: { label: 'Processing…', color: 'text-amber-400' },
      finished: { label: 'Interview ended', color: 'text-zinc-500' },
    }

  const cfg = configs[phase]
  if (!cfg) return <span />

  return (
    <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
  )
}

/**
 * InterviewRoom — Full client-side interview experience.
 *
 * Orchestrates:
 *  - Media stream (camera + mic) via useMediaStream
 *  - Audio analysis for waveform animations via useAudioAnalyser
 *  - AI conversation via AI SDK useChat → /api/interview/chat
 *  - Session state via Zustand useInterviewStore
 */
'use client'

import { useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, CheckCircle2 } from 'lucide-react'
import { useInterviewStore } from '@/store/interview-store'
import { useMediaStream } from '@/hooks/use-media-stream'
import { useAudioAnalyser } from '@/hooks/use-audio-analyser'
import {
  CameraView,
  Waveform,
  AiQuestionStream,
  InterviewControls,
} from '@/components/interview'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

export interface JobData {
  id: string
  title: string
  companyName: string
  description?: string | null
  tags?: string[] | null
  level?: string | null
  jobType?: string | null
  location?: string | null
  locationMode?: string | null
}

interface InterviewRoomProps {
  jobData: JobData
}

/* ------------------------------------------------------------------ */
/* Component                                                             */
/* ------------------------------------------------------------------ */

export function InterviewRoom({ jobData }: InterviewRoomProps) {
  const {
    phase,
    messages: storeMessages,
    streamingQuestion,
    aiSpeaking,
    userSpeaking,
    initSession,
    addMessage,
    setPhase,
    setStreamingQuestion,
    commitStreamingQuestion,
    setAiSpeaking,
    setUserSpeaking,
    reset,
  } = useInterviewStore()

  /* Media stream */
  const {
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
  } = useMediaStream()

  /* Audio analyser — different instances for AI (TTS not yet implemented,
     so we animate based on `aiSpeaking` flag) and user */
  const userAudio = useAudioAnalyser(stream, isAudioActive && userSpeaking)

  /* AI bars: when AI is speaking we generate pseudo-bars from phase */
  const aiBars = Array.from({ length: 12 }, (_, i) =>
    aiSpeaking ? 0.2 + Math.sin(Date.now() / 300 + i) * 0.15 : 0.08,
  )

  /* ---------------------------------------------------------------- */
  /* useChat — Vercel AI SDK                                            */
  /* ---------------------------------------------------------------- */

  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/interview/chat',
    body: {
      jobId: jobData.id,
      jobData: {
        title: jobData.title,
        companyName: jobData.companyName,
        description: jobData.description,
        tags: jobData.tags,
        level: jobData.level,
        jobType: jobData.jobType,
        location: jobData.location,
        locationMode: jobData.locationMode,
      },
    },
    onResponse: () => {
      setPhase('ai_speaking')
      setAiSpeaking(true)
      setStreamingQuestion('')
    },
    onFinish: (message) => {
      setStreamingQuestion(message.content)
      // Give typewriter time to finish before flipping state
      setTimeout(() => {
        commitStreamingQuestion()
        setPhase('user_answering')
        setAiSpeaking(false)
      }, message.content.length * 18 + 200)
    },
    onError: () => {
      setPhase('user_answering')
      setAiSpeaking(false)
    },
  })

  /* Keep streaming text in sync with incoming AI SDK chunks */
  useEffect(() => {
    if (!isLoading) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'assistant') {
      setStreamingQuestion(lastMsg.content)
    }
  }, [messages, isLoading, setStreamingQuestion])

  /* ---------------------------------------------------------------- */
  /* Init                                                               */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    reset()
    initSession(
      jobData.id,
      jobData.title,
      jobData.companyName,
      jobData.description ?? '',
    )
  }, [jobData.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Start media + kick-off first AI question on mount */
  useEffect(() => {
    async function init() {
      await startStream()
      setPhase('connecting')

      // Send an empty trigger so the AI provides the opening question
      await append({
        role: 'user',
        content: '[INTERVIEW_START] The interview is beginning. Please introduce yourself and ask the first question.',
      })
    }

    void init()

    return () => {
      stopStream()
      reset()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------------------------------------------------------- */
  /* Handlers                                                           */
  /* ---------------------------------------------------------------- */

  const handleSubmitAnswer = useCallback(
    async (answer: string) => {
      if (!answer.trim()) return
      addMessage('user', answer)
      setUserSpeaking(false)
      setPhase('processing')

      await append({ role: 'user', content: answer })
    },
    [append, addMessage, setPhase, setUserSpeaking],
  )

  const handleEndInterview = useCallback(() => {
    setPhase('finished')
    setAiSpeaking(false)
    stopStream()
  }, [setPhase, setAiSpeaking, stopStream])

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */

  if (phase === 'finished') {
    return <FinishedScreen jobTitle={jobData.title} messageCount={storeMessages.length} />
  }

  /* Current AI text = streaming buffer OR last committed AI message */
  const lastAiMessage = [...storeMessages].reverse().find((m) => m.role === 'ai')
  const displayQuestion = streamingQuestion || lastAiMessage?.content || ''

  return (
    <div className="flex h-[100dvh] flex-col bg-zinc-950 text-zinc-100">
      {/* ---- Top bar ---- */}
      <header className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-200">
            {jobData.title}
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-sm text-zinc-500">{jobData.companyName}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Question counter */}
          <span className="text-xs text-zinc-600">
            Q {Math.max(1, storeMessages.filter((m) => m.role === 'ai').length)} / 6
          </span>
          {/* Live badge */}
          <span className="flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-2.5 py-1 text-xs font-medium text-primary-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
            </span>
            Live
          </span>
        </div>
      </header>

      {/* ---- Main area ---- */}
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-5 lg:flex-row">
        {/* Left: AI panel + question stream */}
        <div className="flex flex-1 flex-col gap-4">
          {/* AI Avatar + waveform */}
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div
              className={cn(
                'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl',
                'bg-primary-500/10 ring-1',
                aiSpeaking
                  ? 'ring-primary-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'ring-primary-500/20',
              )}
            >
              <Bot className="h-7 w-7 text-primary-400" />
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-hidden">
              <p className="text-sm font-medium text-zinc-300">Alex — AI Interviewer</p>
              <Waveform
                bars={aiBars}
                active={aiSpeaking}
                color="emerald"
              />
            </div>
          </div>

          {/* Streaming question */}
          {displayQuestion && (
            <AiQuestionStream
              fullText={displayQuestion}
              isStreaming={isLoading}
            />
          )}

          {/* Conversation history (scrollable, collapsed) */}
          {storeMessages.length > 2 && (
            <details className="group rounded-xl border border-zinc-800 bg-zinc-900/40">
              <summary className="cursor-pointer px-4 py-3 text-xs text-zinc-500 group-open:border-b group-open:border-zinc-800">
                Conversation history ({storeMessages.length} messages)
              </summary>
              <div className="flex max-h-52 flex-col-reverse gap-2 overflow-y-auto p-4">
                {[...storeMessages].reverse().slice(0, -1).map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'rounded-lg px-3 py-2 text-xs',
                      msg.role === 'ai'
                        ? 'border border-primary-500/10 bg-primary-500/5 text-zinc-300'
                        : 'border border-zinc-700/50 bg-zinc-800/50 text-zinc-400',
                    )}
                  >
                    <span className="mb-1 block font-medium">
                      {msg.role === 'ai' ? '🤖 Alex' : '👤 You'}
                    </span>
                    {msg.content}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Right: Camera feed */}
        <div className="flex flex-col gap-4 lg:w-80">
          <CameraView
            videoRef={videoRef}
            permissionState={permissionState}
            errorMessage={errorMessage}
            isVideoActive={isVideoActive}
            className="aspect-[4/3] w-full"
          />

          {/* User waveform */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <span className="text-xs text-zinc-500">Your mic</span>
            <Waveform
              bars={userAudio.bars}
              active={isAudioActive && phase === 'user_answering'}
              color="blue"
              className="flex-1"
            />
          </div>
        </div>
      </main>

      {/* ---- Bottom controls ---- */}
      <footer className="border-t border-zinc-800/60 px-5 py-4">
        <InterviewControls
          phase={phase}
          isAudioActive={isAudioActive}
          isVideoActive={isVideoActive}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onSubmitAnswer={handleSubmitAnswer}
          onEndInterview={handleEndInterview}
        />
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Finished screen                                                       */
/* ------------------------------------------------------------------ */

function FinishedScreen({
  jobTitle,
  messageCount,
}: {
  jobTitle: string
  messageCount: number
}) {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-zinc-950">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-10 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/15 ring-1 ring-primary-500/30">
            <CheckCircle2 className="h-8 w-8 text-primary-400" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Interview Complete</h1>
            <p className="mt-1 text-sm text-zinc-400">
              You answered {Math.floor(messageCount / 2)} question
              {messageCount / 2 !== 1 ? 's' : ''} for{' '}
              <span className="text-zinc-200">{jobTitle}</span>
            </p>
          </div>
          <p className="text-sm text-zinc-500">
            Your AI feedback report is being generated. You&apos;ll find it in
            your dashboard shortly.
          </p>
          <a
            href="/dashboard"
            className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] transition hover:bg-primary-400"
          >
            Go to Dashboard
          </a>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

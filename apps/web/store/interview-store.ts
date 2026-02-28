/**
 * interview-store.ts
 *
 * Zustand store for a single interview session.
 * Persists within the browser session only (not localStorage) to avoid
 * sensitive conversation data leaking across tabs.
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

export type MessageRole = 'ai' | 'user'

export interface InterviewMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

export type InterviewPhase =
  | 'idle'           // Not started
  | 'connecting'     // Setting up media / fetching JD
  | 'ai_speaking'    // AI is streaming a question
  | 'user_answering' // User is speaking their answer
  | 'processing'     // Sending user answer to AI, waiting for response
  | 'finished'       // Interview ended

export interface InterviewState {
  /* Session data */
  jobId: string | null
  jobTitle: string | null
  companyName: string | null
  jobDescription: string | null
  /** Server-side interview record ID (created on session start) */
  interviewId: string | null

  /* Conversation */
  messages: InterviewMessage[]
  /** The text currently being streamed character-by-character */
  streamingQuestion: string

  /* UI phase */
  phase: InterviewPhase

  /* Audio state */
  aiSpeaking: boolean
  userSpeaking: boolean

  /* Actions */
  initSession: (jobId: string, jobTitle: string, companyName: string, jd: string) => void
  setInterviewId: (id: string) => void
  addMessage: (role: MessageRole, content: string) => void
  setStreamingQuestion: (text: string) => void
  appendStreamingQuestion: (chunk: string) => void
  commitStreamingQuestion: () => void
  setPhase: (phase: InterviewPhase) => void
  setAiSpeaking: (v: boolean) => void
  setUserSpeaking: (v: boolean) => void
  reset: () => void
}

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

let msgCounter = 0
function newId() {
  return `msg-${Date.now()}-${++msgCounter}`
}

/* ------------------------------------------------------------------ */
/* Store                                                                 */
/* ------------------------------------------------------------------ */

const initialState = {
  jobId: null,
  jobTitle: null,
  companyName: null,
  jobDescription: null,
  interviewId: null,
  messages: [] as InterviewMessage[],
  streamingQuestion: '',
  phase: 'idle' as InterviewPhase,
  aiSpeaking: false,
  userSpeaking: false,
}

export const useInterviewStore = create<InterviewState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initSession: (jobId, jobTitle, companyName, jd) =>
        set(
          {
            jobId,
            jobTitle,
            companyName,
            jobDescription: jd,
            interviewId: null,
            messages: [],
            streamingQuestion: '',
            phase: 'connecting',
          },
          false,
          'initSession',
        ),

      setInterviewId: (id) =>
        set({ interviewId: id }, false, 'setInterviewId'),

      addMessage: (role, content) =>
        set(
          (s) => ({
            messages: [
              ...s.messages,
              { id: newId(), role, content, timestamp: new Date() },
            ],
          }),
          false,
          'addMessage',
        ),

      setStreamingQuestion: (text) =>
        set({ streamingQuestion: text }, false, 'setStreamingQuestion'),

      appendStreamingQuestion: (chunk) =>
        set(
          (s) => ({ streamingQuestion: s.streamingQuestion + chunk }),
          false,
          'appendStreamingQuestion',
        ),

      /**
       * When streaming finishes, commit the full text as a proper AI message
       * and clear the in-flight buffer.
       */
      commitStreamingQuestion: () => {
        const { streamingQuestion, addMessage } = get()
        if (streamingQuestion.trim()) {
          addMessage('ai', streamingQuestion)
        }
        set({ streamingQuestion: '' }, false, 'commitStreamingQuestion')
      },

      setPhase: (phase) => set({ phase }, false, 'setPhase'),
      setAiSpeaking: (v) => set({ aiSpeaking: v }, false, 'setAiSpeaking'),
      setUserSpeaking: (v) => set({ userSpeaking: v }, false, 'setUserSpeaking'),

      reset: () => set({ ...initialState }, false, 'reset'),
    }),
    { name: 'interview-store' },
  ),
)

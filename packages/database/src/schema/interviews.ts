import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { jobs } from './jobs'

/* ------------------------------------------------------------------ */
/* Enum                                                                 */
/* ------------------------------------------------------------------ */

export const interviewStatusEnum = pgEnum('interview_status', [
  'pending',
  'processing',
  'completed',
  'failed',
])

/* ------------------------------------------------------------------ */
/* AI Feedback Type (stored as JSONB)                                  */
/* ------------------------------------------------------------------ */

/**
 * AiFeedbackItem — Structured feedback block for a single question.
 */
export type AiFeedbackItem = {
  questionId: string
  question: string
  answer: string
  scoreOutOf10: number
  strengths: string[]
  improvements: string[]
  modelAnswer?: string
}

/**
 * AiFeedback — Full AI evaluation stored as JSONB.
 * Allows rich, structured data without schema migrations for new feedback fields.
 *
 * Radar chart axes: communication, technical, behavioral, problemSolving, domainExpertise
 */
export type AiFeedback = {
  overallSummary: string
  // Five radar axes (0–100 each)
  communicationScore: number
  technicalScore: number
  behavioralScore: number
  problemSolvingScore: number
  domainExpertiseScore: number
  // Narrative feedback
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  items: AiFeedbackItem[]
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire'
}

/* ------------------------------------------------------------------ */
/* Table                                                                */
/* ------------------------------------------------------------------ */

/**
 * interviews — AI interview sessions linked to a user and optionally a job.
 *
 * Architecture decision: `aiFeedback` is JSONB rather than a separate table
 * because each feedback blob is always fetched with its parent interview
 * and never queried independently. This avoids an expensive JOIN on the
 * hot read path in the review page.
 *
 * `aiScore` (0-100) is extracted as a dedicated integer column to enable
 * indexed sorting/filtering on the leaderboard without parsing JSONB.
 */
export const interviews = pgTable('interviews', {
  id: uuid('id').primaryKey().defaultRandom(),

  // FK → users.id (Clerk ID)
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // FK → jobs.id — nullable (user can practice without a target job)
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }),

  // URL to the recorded interview video (stored in object storage)
  videoUrl: text('video_url'),

  // Composite score 0–100 extracted from AI evaluation for fast queries
  aiScore: integer('ai_score'),

  // Full structured AI evaluation (see AiFeedback type above)
  aiFeedback: jsonb('ai_feedback').$type<AiFeedback>(),

  status: interviewStatusEnum('status').notNull().default('pending'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

/* ------------------------------------------------------------------ */
/* Relations (for Drizzle relational queries)                           */
/* ------------------------------------------------------------------ */

export const interviewsRelations = relations(interviews, ({ one }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [interviews.jobId],
    references: [jobs.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  interviews: many(interviews),
}))

export const jobsRelations = relations(jobs, ({ many }) => ({
  interviews: many(interviews),
}))

/* ------------------------------------------------------------------ */
/* Inferred Types                                                       */
/* ------------------------------------------------------------------ */

export type DbInterview = typeof interviews.$inferSelect
export type DbInterviewInsert = typeof interviews.$inferInsert

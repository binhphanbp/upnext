/**
 * @upnext/types — Shared TypeScript types for the UpNext monorepo.
 *
 * Single source of truth for ALL types consumed by apps/web and apps/server.
 *
 * Strategy:
 *  - Domain types (User, Job, Interview) are derived directly from the
 *    Drizzle schema via `$inferSelect` / `$inferInsert`  →  zero drift
 *    between DB schema and TypeScript types.
 *  - API utility types (wrappers, pagination) are defined here.
 *  - JSONB sub-types (AiFeedback, SalaryRange) re-exported from @upnext/database.
 */

/* ------------------------------------------------------------------ */
/* Re-export DB-inferred types (canonical domain types)                 */
/* ------------------------------------------------------------------ */

/**
 * Re-export every table row type, insert type, enum value type, and
 * JSONB sub-type from the database package.  Consumers import from
 * "@upnext/types" — they never need to know these come from Drizzle.
 */
export type {
  // ── Users ──────────────────────────────────────────────────────────
  DbUser,
  DbUserInsert,

  // ── Jobs ───────────────────────────────────────────────────────────
  DbJob,
  DbJobInsert,
  SalaryRange,

  // ── Interviews ─────────────────────────────────────────────────────
  DbInterview,
  DbInterviewInsert,
  AiFeedback,
  AiFeedbackItem,
} from '@upnext/database'

/**
 * Re-export enum *value* unions so callers can do:
 *   import type { UserRole, JobStatus } from '@upnext/types'
 */
export type UserRole = 'candidate' | 'recruiter' | 'admin'
export type JobStatus = 'draft' | 'active' | 'closed' | 'archived'
export type JobLocation = 'remote' | 'hybrid' | 'onsite'
export type JobLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal'
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship'
export type InterviewStatus = 'pending' | 'processing' | 'completed' | 'failed'

/* ------------------------------------------------------------------ */
/* API Response Wrappers                                                */
/* ------------------------------------------------------------------ */

export type ApiSuccess<T> = {
  data: T
  message?: string
}

export type ApiError = {
  statusCode: number
  message: string
  error?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

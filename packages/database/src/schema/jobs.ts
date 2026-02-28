import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'

/* ------------------------------------------------------------------ */
/* Enums                                                                */
/* ------------------------------------------------------------------ */

export const jobStatusEnum = pgEnum('job_status', [
  'draft',
  'active',
  'closed',
  'archived',
])

export const jobLocationEnum = pgEnum('job_location', [
  'remote',
  'hybrid',
  'onsite',
])

export const jobLevelEnum = pgEnum('job_level', [
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
  'principal',
])

export const jobTypeEnum = pgEnum('job_type', [
  'full-time',
  'part-time',
  'contract',
  'internship',
])

/* ------------------------------------------------------------------ */
/* Salary Range Type (stored as JSONB)                                 */
/* ------------------------------------------------------------------ */

/**
 * SalaryRange — Stored as a JSONB column so we can support flexible
 * salary structures (min/max, currency, period) without extra columns.
 *
 * Example: { min: 80000, max: 120000, currency: "USD", period: "year" }
 */
export type SalaryRange = {
  min: number
  max: number
  currency: string
  period: 'hour' | 'month' | 'year'
}

/* ------------------------------------------------------------------ */
/* Table                                                                */
/* ------------------------------------------------------------------ */

/**
 * jobs — Job listings posted by recruiters or imported from partners.
 *
 * `tags` uses a native Postgres text array for zero-cost tag filtering
 * without a separate join table at this scale.
 * `salaryRange` is JSONB to accommodate multi-currency / hourly / annual.
 */
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),

  title: varchar('title', { length: 255 }).notNull(),

  description: text('description').notNull(),

  companyName: varchar('company_name', { length: 255 }).notNull(),

  /**
   * Stored as JSONB: { min, max, currency, period }
   * Typed via the SalaryRange helper above.
   */
  salaryRange: jsonb('salary_range').$type<SalaryRange>(),

  location: varchar('location', { length: 255 }),

  locationMode: jobLocationEnum('location_mode').notNull().default('remote'),

  level: jobLevelEnum('level').notNull().default('mid'),

  jobType: jobTypeEnum('job_type').notNull().default('full-time'),

  /**
   * tags — Native Postgres `text[]` array.
   * Drizzle models this as `text('tags').array()`.
   */
  tags: text('tags').array().notNull().default([]),

  status: jobStatusEnum('status').notNull().default('draft'),

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
/* Inferred Types                                                       */
/* ------------------------------------------------------------------ */

export type DbJob = typeof jobs.$inferSelect
export type DbJobInsert = typeof jobs.$inferInsert

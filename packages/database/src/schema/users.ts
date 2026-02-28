import { pgTable, pgEnum, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '../utils/id'

/* ------------------------------------------------------------------ */
/* Enum                                                                 */
/* ------------------------------------------------------------------ */

/**
 * userRoleEnum — Matches the three actor types in UpNext.
 * Values are intentionally lowercase strings (stable DB constraint).
 */
export const userRoleEnum = pgEnum('user_role', [
  'candidate',
  'recruiter',
  'admin',
])

/* ------------------------------------------------------------------ */
/* Table                                                                */
/* ------------------------------------------------------------------ */

/**
 * users — Core identity table.
 *
 * The primary key (`id`) is the Clerk user ID (e.g. "user_2xAbc...")
 * so we never need a surrogate UUID for users — Clerk is the source
 * of truth for authentication; we only persist profile data here.
 */
export const users = pgTable('users', {
  // Clerk user ID as PK — avoids a redundant UUID column
  id: varchar('id', { length: 255 }).primaryKey(),

  email: varchar('email', { length: 255 }).notNull().unique(),

  fullName: varchar('full_name', { length: 255 }).notNull(),

  avatarUrl: text('avatar_url'),

  role: userRoleEnum('role').notNull().default('candidate'),

  // Timestamps — always present on every table
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

/** Full row returned from a SELECT */
export type DbUser = typeof users.$inferSelect

/** Columns required/allowed for an INSERT */
export type DbUserInsert = typeof users.$inferInsert

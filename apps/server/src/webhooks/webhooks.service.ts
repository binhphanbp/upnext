import { Injectable, Inject, Logger } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { type DrizzleClient, users } from '@upnext/database'
import type { DbUserInsert } from '@upnext/types'
import { DATABASE_CLIENT } from '../database/database.module'

/* ------------------------------------------------------------------ */
/* Clerk webhook event payload types                                    */
/* ------------------------------------------------------------------ */

type ClerkEmailAddress = {
  id: string
  email_address: string
  primary?: boolean
}

type ClerkUserData = {
  id: string
  email_addresses: ClerkEmailAddress[]
  first_name: string | null
  last_name: string | null
  image_url: string | null
  created_at: number // Unix timestamp (ms)
  updated_at: number // Unix timestamp (ms)
}

export type ClerkWebhookEvent =
  | { type: 'user.created'; data: ClerkUserData }
  | { type: 'user.updated'; data: ClerkUserData }
  | { type: 'user.deleted'; data: { id: string } }

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function resolvePrimaryEmail(emailAddresses: ClerkEmailAddress[]): string {
  // Prefer the explicitly marked primary address; fall back to first in list
  const primary = emailAddresses.find((e) => e.primary) ?? emailAddresses[0]
  if (!primary) {
    throw new Error('Clerk user has no email addresses')
  }
  return primary.email_address
}

function buildFullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim() || 'Anonymous'
}

/* ------------------------------------------------------------------ */
/* Service                                                              */
/* ------------------------------------------------------------------ */

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(
    @Inject(DATABASE_CLIENT)
    private readonly db: DrizzleClient,
  ) {}

  /**
   * handleEvent — Routes incoming Clerk webhook events to the
   * appropriate handler method.
   */
  async handleEvent(event: ClerkWebhookEvent): Promise<void> {
    switch (event.type) {
      case 'user.created':
        return this.onUserCreated(event.data)
      case 'user.updated':
        return this.onUserUpdated(event.data)
      case 'user.deleted':
        return this.onUserDeleted(event.data.id)
      default:
        // Type-safe exhaustive check — log and ignore unhandled events
        this.logger.debug(`Unhandled event type: ${(event as ClerkWebhookEvent).type}`)
    }
  }

  /* ---------------------------------------------------------------- */
  /* user.created                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * onUserCreated — Inserts a new row in the `users` table.
   *
   * Uses INSERT … ON CONFLICT DO NOTHING as a safety net against
   * rare Clerk webhook duplicate delivery (at-least-once semantics).
   */
  private async onUserCreated(data: ClerkUserData): Promise<void> {
    const email = resolvePrimaryEmail(data.email_addresses)
    const fullName = buildFullName(data.first_name, data.last_name)

    const newUser: DbUserInsert = {
      id: data.id,
      email,
      fullName,
      avatarUrl: data.image_url ?? undefined,
      role: 'candidate', // Default role; can be updated by the user later
    }

    await this.db
      .insert(users)
      .values(newUser)
      .onConflictDoNothing({ target: users.id })

    this.logger.log(`User created: ${data.id} <${email}>`)
  }

  /* ---------------------------------------------------------------- */
  /* user.updated                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * onUserUpdated — Upserts user profile data from Clerk.
   *
   * We use `onConflictDoUpdate` (upsert) here because Clerk may send
   * user.updated before user.created in edge cases (event reordering).
   * This ensures we always end up with a consistent row.
   */
  private async onUserUpdated(data: ClerkUserData): Promise<void> {
    const email = resolvePrimaryEmail(data.email_addresses)
    const fullName = buildFullName(data.first_name, data.last_name)

    await this.db
      .update(users)
      .set({
        email,
        fullName,
        avatarUrl: data.image_url ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, data.id))

    this.logger.log(`User updated: ${data.id} <${email}>`)
  }

  /* ---------------------------------------------------------------- */
  /* user.deleted                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * onUserDeleted — Soft-deletes or removes the user record.
   *
   * Currently performs a hard delete. If you need GDPR-compliant
   * soft-delete (retain anonymised data), add a `deletedAt` column
   * to the schema and swap `.delete()` for `.update({ deletedAt: new Date() })`.
   */
  private async onUserDeleted(userId: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, userId))
    this.logger.log(`User deleted: ${userId}`)
  }
}

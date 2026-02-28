import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index'

/**
 * createDrizzleClient — Factory that creates a Drizzle client backed by
 * postgres.js.
 *
 * Architecture decision: We expose a factory instead of a singleton so
 * that:
 *  1. Tests can spin up isolated clients with a test DATABASE_URL.
 *  2. Future edge deployments (e.g. Neon serverless) can inject their
 *     own transport without changing callers.
 *
 * `max: 1` is the recommended setting for serverless / short-lived
 * environments (Vercel, Lambda) — increase for long-lived Node servers.
 */
export function createDrizzleClient(connectionString: string) {
  const queryClient = postgres(connectionString, {
    max: process.env.NODE_ENV === 'production' ? 10 : 1,
    idle_timeout: 30,
    connect_timeout: 10,
  })

  return drizzle(queryClient, {
    schema,
    // casing: 'snake_case' maps camelCase JS properties → snake_case columns
    // automatically, matching the `casing` option in drizzle.config.ts.
    casing: 'snake_case',
    logger: process.env.NODE_ENV === 'development',
  })
}

/** Convenience type for the Drizzle instance used throughout the app. */
export type DrizzleClient = ReturnType<typeof createDrizzleClient>

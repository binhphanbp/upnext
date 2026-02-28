import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle Kit configuration.
 *
 * Commands:
 *   pnpm --filter @upnext/database db:generate  — generate SQL migration files
 *   pnpm --filter @upnext/database db:push      — push schema directly (dev only)
 *   pnpm --filter @upnext/database db:migrate   — apply pending migrations
 *   pnpm --filter @upnext/database db:studio    — open Drizzle Studio UI
 *
 * Architecture decision: migrations output to `./drizzle/migrations` so they
 * live alongside the schema source and can be committed to git for full audit trail.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle/migrations',
  casing: 'snake_case',
  dbCredentials: {
    // Reads DATABASE_URL from .env.local → .env at the db package root
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})

import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createDrizzleClient, type DrizzleClient } from '@upnext/database'

/**
 * DATABASE_CLIENT — Injection token used throughout the server.
 * Prefer injecting this token over importing the client directly
 * to keep modules testable (easy to swap with a test double).
 */
export const DATABASE_CLIENT = Symbol('DATABASE_CLIENT')

/**
 * DatabaseModule — Global module that provides the Drizzle client.
 *
 * Marked `@Global()` so every feature module receives the DB client
 * via `@Inject(DATABASE_CLIENT)` without needing to import DatabaseModule
 * explicitly in each feature module.
 *
 * Architecture: Using a factory provider gives us the flexibility to
 * swap the connection strategy (e.g., Neon serverless HTTP driver) later
 * without touching any consumer.
 */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): DrizzleClient => {
        const url = config.getOrThrow<string>('DATABASE_URL')
        return createDrizzleClient(url)
      },
    },
  ],
  exports: [DATABASE_CLIENT],
})
export class DatabaseModule {}

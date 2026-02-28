import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'
import { WebhooksModule } from './webhooks/webhooks.module'
import { JobsModule } from './jobs/jobs.module'

/**
 * AppModule — Root module of the UpNext NestJS application.
 *
 * Architecture: Feature modules are registered here as the application grows.
 * Each feature module (e.g., JobsModule, InterviewModule, AuthModule) lives
 * in its own directory under src/ with its own controller, service, and DTOs.
 */
@Module({
  imports: [
    // ConfigModule makes environment variables available via ConfigService
    // throughout the entire module tree (isGlobal: true).
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // DatabaseModule provides the Drizzle client globally across all modules
    DatabaseModule,

    // WebhooksModule handles incoming Clerk webhook events
    WebhooksModule,

    // Feature modules
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

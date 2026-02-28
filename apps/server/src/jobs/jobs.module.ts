import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JobsController } from './jobs.controller'
import { JobsService } from './jobs.service'
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard'

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    // Register ClerkAuthGuard as a provided service so NestJS DI
    // can resolve its ConfigService + Reflector dependencies.
    ClerkAuthGuard,
  ],
  exports: [JobsService],
})
export class JobsModule {}

import { Module } from '@nestjs/common'
import { InterviewsService } from './interviews.service'
import { InterviewsController } from './interviews.controller'
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard'

@Module({
  controllers: [InterviewsController],
  providers: [InterviewsService, ClerkAuthGuard],
  exports: [InterviewsService],
})
export class InterviewsModule {}

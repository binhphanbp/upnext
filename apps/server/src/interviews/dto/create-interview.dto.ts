import { IsUUID, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateInterviewDto {
  @ApiProperty({ description: 'ID of the job being practiced for' })
  @IsUUID()
  jobId: string

  @ApiPropertyOptional({ description: 'URL of the recorded session video (if available)' })
  @IsOptional()
  videoUrl?: string
}

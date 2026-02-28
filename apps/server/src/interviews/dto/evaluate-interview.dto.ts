import {
  IsArray,
  IsIn,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class TranscriptMessageDto {
  @ApiProperty({ enum: ['ai', 'user'] })
  @IsIn(['ai', 'user'])
  role: 'ai' | 'user'

  @ApiProperty()
  @IsString()
  content: string
}

export class EvaluateInterviewDto {
  @ApiProperty({
    type: [TranscriptMessageDto],
    description: 'Full Q&A transcript — AI questions and user answers',
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => TranscriptMessageDto)
  transcript: TranscriptMessageDto[]
}

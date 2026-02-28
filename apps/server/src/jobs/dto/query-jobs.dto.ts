import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryJobsDto {
  @ApiPropertyOptional({ description: 'Full-text search on title and description', example: 'senior react' })
  @IsOptional()
  @IsString()
  q?: string

  @ApiPropertyOptional({ description: 'Filter by comma-separated skill tags', example: 'react,typescript' })
  @IsOptional()
  @IsString()
  tags?: string

  @ApiPropertyOptional({ enum: ['remote', 'hybrid', 'onsite'] })
  @IsOptional()
  @IsEnum(['remote', 'hybrid', 'onsite'])
  location?: 'remote' | 'hybrid' | 'onsite'

  @ApiPropertyOptional({ enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'principal'] })
  @IsOptional()
  @IsEnum(['intern', 'junior', 'mid', 'senior', 'lead', 'principal'])
  level?: string

  @ApiPropertyOptional({ enum: ['full-time', 'part-time', 'contract', 'internship'] })
  @IsOptional()
  @IsEnum(['full-time', 'part-time', 'contract', 'internship'])
  jobType?: string

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 12
}

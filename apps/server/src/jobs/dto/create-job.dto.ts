import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SalaryRangeDto {
  @ApiProperty({ example: 80000 })
  @IsNumber()
  @Min(0)
  min!: number

  @ApiProperty({ example: 120000 })
  @IsNumber()
  @Min(0)
  max!: number

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency!: string

  @ApiProperty({ enum: ['hour', 'month', 'year'] })
  @IsEnum(['hour', 'month', 'year'])
  period!: 'hour' | 'month' | 'year'
}

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Frontend Engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string

  @ApiProperty({ example: 'We are looking for a Senior Frontend Engineer...' })
  @IsString()
  @IsNotEmpty()
  description!: string

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  companyName!: string

  @ApiPropertyOptional({ type: SalaryRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salaryRange?: SalaryRangeDto

  @ApiPropertyOptional({ example: 'Ho Chi Minh City, Vietnam' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string

  @ApiPropertyOptional({ enum: ['remote', 'hybrid', 'onsite'], default: 'remote' })
  @IsOptional()
  @IsEnum(['remote', 'hybrid', 'onsite'])
  locationMode?: 'remote' | 'hybrid' | 'onsite'

  @ApiPropertyOptional({ enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'principal'], default: 'mid' })
  @IsOptional()
  @IsEnum(['intern', 'junior', 'mid', 'senior', 'lead', 'principal'])
  level?: string

  @ApiPropertyOptional({ enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' })
  @IsOptional()
  @IsEnum(['full-time', 'part-time', 'contract', 'internship'])
  jobType?: string

  @ApiPropertyOptional({ type: [String], example: ['React', 'TypeScript', 'Next.js'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}

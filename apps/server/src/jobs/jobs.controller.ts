import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { JobsService } from './jobs.service'
import { QueryJobsDto } from './dto/query-jobs.dto'
import { CreateJobDto } from './dto/create-job.dto'
import { ClerkAuthGuard, Public, CurrentUserId } from '../common/guards/clerk-auth.guard'

@ApiTags('Jobs')
@UseGuards(ClerkAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * GET /api/v1/jobs
   * Public — paginated, filterable job listing.
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'List active jobs with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated job listing' })
  findAll(@Query() query: QueryJobsDto) {
    return this.jobsService.findAll(query)
  }

  /**
   * GET /api/v1/jobs/:id
   * Public — single job detail by UUID.
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get job detail by ID' })
  @ApiResponse({ status: 200, description: 'Job detail' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.findOne(id)
  }

  /**
   * POST /api/v1/jobs
   * Protected — recruiter creates a new job listing.
   * Token validates against Clerk; userId injected via @CurrentUserId().
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job listing (recruiter only)' })
  @ApiResponse({ status: 201, description: 'Job created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createJobDto: CreateJobDto,
    @CurrentUserId() userId: string,
  ) {
    return this.jobsService.create(createJobDto, userId)
  }
}

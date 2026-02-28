import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { and, arrayContains, count, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { jobs, type DrizzleClient } from '@upnext/database'
import type { DbJob, DbJobInsert, PaginatedResponse } from '@upnext/types'
import { DATABASE_CLIENT } from '../database/database.module'
import type { QueryJobsDto } from './dto/query-jobs.dto'
import type { CreateJobDto } from './dto/create-job.dto'

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name)

  constructor(
    @Inject(DATABASE_CLIENT)
    private readonly db: DrizzleClient,
  ) {}

  /* ---------------------------------------------------------------- */
  /* GET /jobs — paginated + filtered listing                          */
  /* ---------------------------------------------------------------- */

  async findAll(query: QueryJobsDto): Promise<PaginatedResponse<DbJob>> {
    const { q, tags, location, level, jobType, page = 1, pageSize = 12 } = query
    const offset = (page - 1) * pageSize

    // Build dynamic WHERE conditions
    const conditions = [
      // Only show active jobs publicly
      eq(jobs.status, 'active'),

      // Full-text search across title + description (case-insensitive)
      q ? or(
        ilike(jobs.title, `%${q}%`),
        ilike(jobs.description, `%${q}%`),
        ilike(jobs.companyName, `%${q}%`),
      ) : undefined,

      // Tags filter — Postgres `@>` array containment operator
      // Matches jobs that contain ALL of the requested tags
      tags
        ? arrayContains(
            jobs.tags,
            tags.split(',').map((t) => t.trim()).filter(Boolean),
          )
        : undefined,

      location ? eq(jobs.locationMode, location as 'remote' | 'hybrid' | 'onsite') : undefined,

      level ? eq(jobs.level, level as DbJob['level']) : undefined,

      jobType ? eq(jobs.jobType, jobType as DbJob['jobType']) : undefined,
    ].filter((c) => c !== undefined)

    const where = conditions.length > 1 ? and(...conditions) : conditions[0]

    // Execute data query and count query in parallel for performance
    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(jobs)
        .where(where)
        .orderBy(desc(jobs.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ total: count() })
        .from(jobs)
        .where(where),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return {
      data: rows,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  /* ---------------------------------------------------------------- */
  /* GET /jobs/:id — single job detail                                 */
  /* ---------------------------------------------------------------- */

  async findOne(id: string): Promise<DbJob> {
    const [job] = await this.db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.status, 'active')))
      .limit(1)

    if (!job) {
      throw new NotFoundException(`Job with id "${id}" not found`)
    }

    return job
  }

  /* ---------------------------------------------------------------- */
  /* POST /jobs — create a new listing (recruiter only)               */
  /* ---------------------------------------------------------------- */

  async create(dto: CreateJobDto, userId: string): Promise<DbJob> {
    const newJob: DbJobInsert = {
      title: dto.title,
      description: dto.description,
      companyName: dto.companyName,
      salaryRange: dto.salaryRange,
      location: dto.location,
      locationMode: dto.locationMode ?? 'remote',
      level: dto.level as DbJob['level'] ?? 'mid',
      jobType: dto.jobType as DbJob['jobType'] ?? 'full-time',
      tags: dto.tags ?? [],
      // New jobs start as 'draft' — must be activated manually or via admin
      status: 'draft',
    }

    const [created] = await this.db.insert(jobs).values(newJob).returning()

    this.logger.log(`Job created: "${created.title}" [${created.id}] by user ${userId}`)

    return created
  }
}

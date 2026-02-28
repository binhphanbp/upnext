import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { interviews, jobs, type DrizzleClient } from '@upnext/database'
import type { DbInterview, DbJob, AiFeedback } from '@upnext/types'
import { DATABASE_CLIENT } from '../database/database.module'
import type { CreateInterviewDto } from './dto/create-interview.dto'
import type { EvaluateInterviewDto } from './dto/evaluate-interview.dto'

/* ------------------------------------------------------------------ */
/* Zod schema for Gemini structured output                              */
/* ------------------------------------------------------------------ */

const feedbackItemSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  answer: z.string(),
  scoreOutOf10: z.number().min(0).max(10),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  modelAnswer: z.string().optional(),
})

const aiFeedbackSchema = z.object({
  overallSummary: z.string().describe('2–3 paragraph executive summary of candidate performance'),
  communicationScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  behavioralScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  domainExpertiseScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).min(1).max(6),
  weaknesses: z.array(z.string()).min(1).max(4),
  improvements: z.array(z.string()).min(1).max(5),
  recommendation: z.enum(['strong_hire', 'hire', 'no_hire', 'strong_no_hire']),
  items: z.array(feedbackItemSchema),
})

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

/**
 * Weighted composite score (0–100):
 *   Technical:        35%
 *   Communication:    25%
 *   Domain Expertise: 20%
 *   Behavioral:       10%
 *   Problem Solving:  10%
 */
function computeOverallScore(fb: z.infer<typeof aiFeedbackSchema>): number {
  return Math.round(
    fb.technicalScore * 0.35 +
    fb.communicationScore * 0.25 +
    fb.domainExpertiseScore * 0.2 +
    fb.behavioralScore * 0.1 +
    fb.problemSolvingScore * 0.1,
  )
}

function buildSystemPrompt(
  job: DbJob,
  transcript: { role: 'ai' | 'user'; content: string }[],
): string {
  const skills = (job.tags as string[] | null)?.join(', ') ?? 'Not specified'
  const level = job.level ?? 'Not specified'
  const jobType = job.jobType ?? 'Not specified'

  const formattedTranscript = transcript
    .map((m) => `[${m.role === 'ai' ? 'Interviewer' : 'Candidate'}]: ${m.content}`)
    .join('\n\n')

  return `You are a senior HR professional and technical interview evaluator with 15+ years of experience assessing software engineering candidates.

## Position Details
- **Role:** ${job.title}
- **Company:** ${job.companyName}
- **Level:** ${level}
- **Type:** ${jobType}
- **Required Skills:** ${skills}
${job.description ? `\n## Job Description\n${job.description}\n` : ''}

## Interview Transcript
${formattedTranscript}

## Your Task
Evaluate the candidate's performance across 5 dimensions. Be honest, constructive, and specific — cite actual moments from the transcript.

### Scoring Dimensions (0–100 each):
- **communicationScore**: Clarity, structure, conciseness, confidence, professional language
- **technicalScore**: Technical accuracy, depth of knowledge, correct use of concepts
- **behavioralScore**: STAR method usage, teamwork, leadership, self-awareness
- **problemSolvingScore**: Analytical thinking, creative approaches, breaking down complexity
- **domainExpertiseScore**: Relevance and depth of knowledge for this specific role/skills

### Recommendation Guide:
- **strong_hire**: Exceptional performance, exceeds requirements
- **hire**: Solid performance, meets requirements  
- **no_hire**: Significant gaps, does not meet requirements
- **strong_no_hire**: Very poor performance, major red flags

Provide a thorough, professional evaluation that will help the candidate grow.`
}

/* ------------------------------------------------------------------ */
/* Service                                                               */
/* ------------------------------------------------------------------ */

export interface InterviewWithJob {
  interview: DbInterview
  job: DbJob | null
}

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name)

  constructor(
    @Inject(DATABASE_CLIENT)
    private readonly db: DrizzleClient,
    private readonly config: ConfigService,
  ) {}

  /* ---------------------------------------------------------------- */
  /* CREATE — start a new interview session                            */
  /* ---------------------------------------------------------------- */

  async create(userId: string, dto: CreateInterviewDto): Promise<DbInterview> {
    // Verify the job exists
    const [job] = await this.db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.id, dto.jobId))
      .limit(1)

    if (!job) {
      throw new NotFoundException(`Job ${dto.jobId} not found`)
    }

    const [interview] = await this.db
      .insert(interviews)
      .values({
        userId,
        jobId: dto.jobId,
        videoUrl: dto.videoUrl ?? null,
        status: 'pending',
      })
      .returning()

    this.logger.log(`Created interview ${interview.id} for user ${userId}`)
    return interview
  }

  /* ---------------------------------------------------------------- */
  /* EVALUATE — run AI evaluation and persist results                  */
  /* ---------------------------------------------------------------- */

  async evaluate(
    interviewId: string,
    userId: string,
    dto: EvaluateInterviewDto,
  ): Promise<DbInterview> {
    // ── 1. Load interview (verify ownership) ──────────────────────
    const [interview] = await this.db
      .select()
      .from(interviews)
      .where(eq(interviews.id, interviewId))
      .limit(1)

    if (!interview) throw new NotFoundException(`Interview ${interviewId} not found`)
    if (interview.userId !== userId) throw new ForbiddenException('Access denied')
    if (interview.status === 'completed') {
      throw new BadRequestException('This interview has already been evaluated')
    }

    // ── 2. Load the job ───────────────────────────────────────────
    if (!interview.jobId) {
      throw new BadRequestException('Interview has no associated job')
    }

    const [job] = await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, interview.jobId))
      .limit(1)

    if (!job) throw new NotFoundException(`Job ${interview.jobId} not found`)

    // ── 3. Mark as processing ─────────────────────────────────────
    await this.db
      .update(interviews)
      .set({ status: 'processing' })
      .where(eq(interviews.id, interviewId))

    // ── 4. Call Gemini 1.5 Pro ────────────────────────────────────
    const apiKey = this.config.getOrThrow<string>('GOOGLE_GENERATIVE_AI_API_KEY')
    process.env['GOOGLE_GENERATIVE_AI_API_KEY'] = apiKey

    // Filter out system trigger messages
    const cleanTranscript = dto.transcript.filter(
      (m) => !m.content.startsWith('[INTERVIEW_START]'),
    )

    let feedbackData: AiFeedback

    try {
      const systemPrompt = buildSystemPrompt(job, cleanTranscript)

      const { object } = await generateObject({
        model: google('gemini-1.5-pro'),
        schema: aiFeedbackSchema,
        system: systemPrompt,
        prompt: 'Generate a comprehensive, structured evaluation of the candidate interview above.',
        temperature: 0.3, // Lower temp for consistent, professional output
      })

      feedbackData = object as AiFeedback
    } catch (err) {
      // Mark as failed and rethrow
      await this.db
        .update(interviews)
        .set({ status: 'failed' })
        .where(eq(interviews.id, interviewId))

      const msg = err instanceof Error ? err.message : String(err)
      this.logger.error(`Gemini evaluation failed for ${interviewId}: ${msg}`)
      throw new InternalServerErrorException(`AI evaluation failed: ${msg}`)
    }

    // ── 5. Compute composite score ────────────────────────────────
    const aiScore = computeOverallScore(feedbackData)

    // ── 6. Persist results ────────────────────────────────────────
    const [updated] = await this.db
      .update(interviews)
      .set({
        aiScore,
        aiFeedback: feedbackData,
        status: 'completed',
      })
      .where(eq(interviews.id, interviewId))
      .returning()

    this.logger.log(
      `Interview ${interviewId} evaluated — score ${aiScore}/100 (${feedbackData.recommendation})`,
    )

    return updated
  }

  /* ---------------------------------------------------------------- */
  /* GET RESULT — fetch interview + job for result page               */
  /* ---------------------------------------------------------------- */

  async getResult(interviewId: string, userId: string): Promise<InterviewWithJob> {
    const [interview] = await this.db
      .select()
      .from(interviews)
      .where(eq(interviews.id, interviewId))
      .limit(1)

    if (!interview) throw new NotFoundException(`Interview ${interviewId} not found`)
    if (interview.userId !== userId) throw new ForbiddenException('Access denied')

    let job: DbJob | null = null
    if (interview.jobId) {
      const rows = await this.db
        .select()
        .from(jobs)
        .where(eq(jobs.id, interview.jobId))
        .limit(1)
      job = rows[0] ?? null
    }

    return { interview, job }
  }
}

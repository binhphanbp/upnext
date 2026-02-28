import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { ClerkAuthGuard, CurrentUserId } from '../common/guards/clerk-auth.guard'
import { InterviewsService } from './interviews.service'
import { CreateInterviewDto } from './dto/create-interview.dto'
import { EvaluateInterviewDto } from './dto/evaluate-interview.dto'
import type { ApiSuccess } from '@upnext/types'

@ApiTags('Interviews')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  /* ---------------------------------------------------------------- */
  /* POST /interviews — create a new interview session                */
  /* ---------------------------------------------------------------- */

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new interview session for a job' })
  @ApiCreatedResponse({ description: 'Interview session created successfully' })
  async create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateInterviewDto,
  ): Promise<ApiSuccess<{ id: string; status: string }>> {
    const interview = await this.interviewsService.create(userId, dto)
    return {
      data: { id: interview.id, status: interview.status },
      message: 'Interview session created',
    }
  }

  /* ---------------------------------------------------------------- */
  /* POST /interviews/:id/evaluate — run AI evaluation                */
  /* ---------------------------------------------------------------- */

  @Post(':id/evaluate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit the interview transcript for AI evaluation',
    description:
      'Sends the full conversation to Gemini 1.5 Pro for HR-expert evaluation. Returns structured feedback and a 0–100 score.',
  })
  @ApiOkResponse({ description: 'Evaluation complete' })
  async evaluate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
    @Body() dto: EvaluateInterviewDto,
  ) {
    const interview = await this.interviewsService.evaluate(id, userId, dto)
    return {
      data: interview,
      message: 'Interview evaluated successfully',
    }
  }

  /* ---------------------------------------------------------------- */
  /* GET /interviews/:id/result — fetch interview + job data          */
  /* ---------------------------------------------------------------- */

  @Get(':id/result')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the complete AI evaluation result for an interview' })
  @ApiOkResponse({ description: 'Interview result with job details' })
  async getResult(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.interviewsService.getResult(id, userId)
    return { data: result }
  }
}

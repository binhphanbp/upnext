import {
  Controller,
  Post,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Webhook } from 'svix'
import type { FastifyRequest } from 'fastify'
import { WebhooksService, type ClerkWebhookEvent } from './webhooks.service'

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name)

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * POST /api/v1/webhooks/clerk
   *
   * Entry point for all Clerk webhook events.
   *
   * Security: Each request is verified with svix using the
   * CLERK_WEBHOOK_SECRET signing secret from the Clerk dashboard.
   * Any request with an invalid or missing signature is rejected with 400
   * before any business logic runs.
   *
   * To register this endpoint in Clerk Dashboard:
   *   Webhooks → Add Endpoint → https://your-domain.com/api/v1/webhooks/clerk
   *   Subscribe to: user.created, user.updated, user.deleted
   */
  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive and process Clerk webhook events' })
  async handleClerkWebhook(@Req() req: FastifyRequest): Promise<{ received: boolean }> {
    // ── 1. Extract svix signature headers ──────────────────────────────
    const svixId = req.headers['svix-id'] as string | undefined
    const svixTimestamp = req.headers['svix-timestamp'] as string | undefined
    const svixSignature = req.headers['svix-signature'] as string | undefined

    if (!svixId || !svixTimestamp || !svixSignature) {
      this.logger.warn('Webhook rejected: missing svix signature headers')
      throw new BadRequestException('Missing webhook signature headers')
    }

    // ── 2. Get raw body — required by svix for signature verification ──
    // @fastify/rawbody populates req.rawBody (Buffer | string)
    const rawBody = (req as FastifyRequest & { rawBody?: Buffer | string }).rawBody

    if (!rawBody) {
      this.logger.error(
        'Webhook rejected: rawBody is undefined. ' +
        'Ensure @fastify/rawbody is registered in main.ts.',
      )
      throw new InternalServerErrorException('Raw body unavailable')
    }

    // ── 3. Verify signature with svix ──────────────────────────────────
    const webhookSecret = this.configService.getOrThrow<string>('CLERK_WEBHOOK_SECRET')
    const wh = new Webhook(webhookSecret)

    let event: ClerkWebhookEvent

    try {
      event = wh.verify(rawBody.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.warn(`Webhook signature verification failed: ${message}`)
      throw new BadRequestException('Invalid webhook signature')
    }

    // ── 4. Dispatch to service ─────────────────────────────────────────
    this.logger.log(`Received Clerk event: ${event.type} [${event.data.id}]`)

    try {
      await this.webhooksService.handleEvent(event)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error(`Error processing webhook event ${event.type}: ${message}`, err instanceof Error ? err.stack : undefined)
      // Return 200 to avoid Clerk retrying on server-side processing errors.
      // Log the error for investigation but do not surface it to Clerk.
    }

    return { received: true }
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
  createParamDecorator,
  SetMetadata,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { createClerkClient } from '@clerk/backend'
import type { FastifyRequest } from 'fastify'

/* ------------------------------------------------------------------ */
/* Metadata key for public routes                                       */
/* ------------------------------------------------------------------ */

export const IS_PUBLIC_KEY = 'isPublic'

/**
 * @Public() — Decorator to mark a route as public (skip auth guard).
 *
 * Usage:
 *   @Public()
 *   @Get()
 *   findAll() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

/* ------------------------------------------------------------------ */
/* Current User decorator                                              */
/* ------------------------------------------------------------------ */

/**
 * @CurrentUserId() — Extracts the authenticated Clerk user ID
 * from the request object (set by ClerkAuthGuard).
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { userId?: string }>()
    return request.userId!
  },
)

/* ------------------------------------------------------------------ */
/* Guard                                                                */
/* ------------------------------------------------------------------ */

/**
 * ClerkAuthGuard — Validates the Clerk JWT from the `Authorization: Bearer` header.
 *
 * - Public routes (decorated with `@Public()`) bypass this guard entirely.
 * - Protected routes receive `req.userId` (Clerk user ID string).
 *
 * Architecture: Using `createClerkClient` on first request (lazy singleton)
 * avoids double-initialisation and aligns with NestJS DI lifecycle.
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name)
  private clerkClient: ReturnType<typeof createClerkClient> | null = null

  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Allow public routes through without any auth check
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const req = context.switchToHttp().getRequest<FastifyRequest & { userId?: string }>()

    // Extract Bearer token
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header')
    }
    const token = authHeader.slice(7)

    // Lazy-initialise Clerk client (reuse across requests)
    if (!this.clerkClient) {
      this.clerkClient = createClerkClient({
        secretKey: this.config.getOrThrow<string>('CLERK_SECRET_KEY'),
      })
    }

    try {
      const { sub } = await this.clerkClient.verifyToken(token)
      req.userId = sub
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.debug(`Auth token verification failed: ${message}`)
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}

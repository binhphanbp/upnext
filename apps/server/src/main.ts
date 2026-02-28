import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { ValidationPipe, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    /**
     * rawBody: true — NestJS 10.3+ built-in raw body buffering.
     *
     * Stores the raw request body as `req.rawBody` (Buffer), which is
     * required by svix to verify Clerk webhook HMAC signatures.
     * This replaces the need for any external rawbody plugin.
     */
    { rawBody: true },
  )

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1')

  // Global validation pipe — strips unknown properties, validates DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // CORS — allow web app origin
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  })

  // Swagger / OpenAPI docs (disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('UpNext API')
      .setDescription('UpNext AI Interview & Job Portal — REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
    logger.log('Swagger UI available at /api/docs')
  }

  const port = process.env.PORT ?? 3001
  await app.listen(port, '0.0.0.0')
  logger.log(`🚀 Server running on http://localhost:${port}/api/v1`)
}

bootstrap()

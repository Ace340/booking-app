/**
 * Application Bootstrap
 *
 * Production-ready entry point that wires up:
 *   - Validated environment configuration
 *   - Structured JSON logging (via NestJS Logger)
 *   - Global request/response pipeline (validation, transform, logging)
 *   - Global error filters (HTTP + catch-all)
 *   - Request ID correlation middleware
 *   - Versioned API prefix
 *   - Graceful shutdown hooks
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AppConfig, getAppConfig } from './config';
import { resolveLogLevels, AppLogger } from './common/logger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './common/middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Structured JSON logs in production
    logger: resolveLogLevels(),
  });

  const configService = app.get(ConfigService);
  const config = getAppConfig(configService);
  const logger = new AppLogger('Bootstrap', config.isProduction);

  // ─── Global Prefix ────────────────────────────────────────────
  app.setGlobalPrefix(config.apiPrefix);

  // ─── CORS ─────────────────────────────────────────────────────
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  });

  // ─── Request ID Middleware ────────────────────────────────────
  app.use(RequestIdMiddleware);

  // ─── Global Pipes (input validation) ─────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global Filters (error handling) ─────────────────────────
  // Order matters: HttpExceptionFilter handles known HTTP errors first,
  // AllExceptionsFilter catches everything else.
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // ─── Global Interceptors ─────────────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ─── Graceful Shutdown ───────────────────────────────────────
  app.enableShutdownHooks();

  // ─── Start Server ────────────────────────────────────────────
  await app.listen(config.port);
  logger.info(`Server running on http://localhost:${config.port}/${config.apiPrefix}`, {
    env: config.nodeEnv,
    port: config.port,
    prefix: config.apiPrefix,
    corsOrigins: config.corsOrigins,
  });
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { getCorsOrigins } from './config/runtime';
import { RequestTrackerService } from './metrics/request-tracker.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.enableCors({ origin: getCorsOrigins(), credentials: true });

  // Feed real traffic (request count, error rate, latency) into MetricsService
  // instead of the random numbers it used to invent.
  const requestTracker = app.get(RequestTrackerService);
  app.use((req: any, res: any, next: () => void) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      requestTracker.record(Date.now() - startedAt, res.statusCode);
    });
    next();
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Listening on http://0.0.0.0:${port}`);
}

bootstrap();

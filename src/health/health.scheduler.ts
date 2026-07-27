import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HealthChecksService } from './health.service';

@Injectable()
export class HealthScheduler {
  private readonly logger = new Logger(HealthScheduler.name);

  constructor(
    private readonly healthService: HealthChecksService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleHealthChecks() {
    this.logger.log('Running scheduled health checks...');

    await this.healthService.runChecks();
  }
}
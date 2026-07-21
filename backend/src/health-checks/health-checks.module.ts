import { Module } from '@nestjs/common';
import { HealthChecksService } from './health-checks.service';
import { HealthChecksController } from './health-checks.controller';

@Module({
  providers: [HealthChecksService],
  controllers: [HealthChecksController],
})
export class HealthChecksModule {}
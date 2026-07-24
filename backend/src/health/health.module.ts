import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from '../prisma/prisma.module';
import { HealthChecksController } from './health.controller';
import { HealthChecksService } from './health.service';
import { HealthScheduler } from './health.scheduler';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  controllers: [HealthChecksController],
  providers: [HealthChecksService, HealthScheduler],
  exports: [HealthChecksService],
})
export class HealthChecksModule {}
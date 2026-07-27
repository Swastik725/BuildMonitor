import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { RequestTrackerService } from './request-tracker.service';

@Module({
  imports: [PrismaModule],
  controllers: [MetricsController],
  providers: [MetricsService, RequestTrackerService],
  exports: [MetricsService, RequestTrackerService],
})
export class MetricsModule {}

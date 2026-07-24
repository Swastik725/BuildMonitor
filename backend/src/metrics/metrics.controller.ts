import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ListMetricsQueryDto } from './dto/list-metrics.query';
import { MetricsService } from './metrics.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('environments/:environmentId/metrics')
  findByEnvironment(
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: { id: string },
    @Query() query: ListMetricsQueryDto,
  ) {
    return this.metricsService.findByEnvironment(environmentId, user.id, query);
  }
}

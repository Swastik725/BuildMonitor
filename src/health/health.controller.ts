import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HealthChecksService } from './health.service';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class HealthChecksController {
  constructor(private healthChecksService: HealthChecksService) {}

  @Get('projects/:projectId/health')
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.healthChecksService.findByProject(
      projectId,
      user.id,
    );
  }

  @Post('projects/:projectId/health/check')
  checkNow(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.healthChecksService.checkNow(projectId, user.id);
  }

  @Get('health/summary')
  getSummary(@CurrentUser() user: { id: string }) {
    return this.healthChecksService.getSummary(user.id);
  }
}

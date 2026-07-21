import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HealthChecksService } from './health-checks.service';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller()
export class HealthChecksController {
  constructor(private healthChecksService: HealthChecksService) {}

  @Get('projects/:projectId/health')
  findByProject(
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.healthChecksService.findByProject(
      projectId,
      req.user.userId,
    );
  }

  @Get('health/summary')
  getSummary(@Req() req: AuthenticatedRequest) {
    return this.healthChecksService.getSummary(req.user.userId);
  }
}
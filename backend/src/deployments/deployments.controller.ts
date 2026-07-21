import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeploymentsService } from './deployments.service';
import { TriggerDeploymentDto } from './dto/trigger-deployment.dto';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller()
export class DeploymentsController {
  constructor(private deploymentsService: DeploymentsService) {}

  @Post('projects/:projectId/deployments')
  trigger(
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: TriggerDeploymentDto,
  ) {
    return this.deploymentsService.trigger(
      projectId,
      req.user.userId,
      dto,
    );
  }

  @Get('projects/:projectId/deployments')
  findAllByProject(
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deploymentsService.findAllByProject(
      projectId,
      req.user.userId,
    );
  }

  @Get('deployments')
  findAllRecent(@Req() req: AuthenticatedRequest) {
    return this.deploymentsService.findAllRecent(req.user.userId);
  }

  @Get('deployments/:id')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deploymentsService.findOne(id, req.user.userId);
  }

  @Get('deployments/:id/logs')
  findLogs(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deploymentsService.findLogs(id, req.user.userId);
  }
}
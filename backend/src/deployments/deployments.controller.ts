import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeploymentsService } from './deployments.service';
import { TriggerDeploymentDto } from './dto/trigger-deployment.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class DeploymentsController {
  constructor(private deploymentsService: DeploymentsService) {}

  @Post('projects/:projectId/deployments')
  trigger(@Param('projectId') projectId: string, @Req() req, @Body() dto: TriggerDeploymentDto) {
    return this.deploymentsService.trigger(projectId, req.user.userId, dto);
  }

  @Get('projects/:projectId/deployments')
  findAllByProject(@Param('projectId') projectId: string) {
    return this.deploymentsService.findAllByProject(projectId);
  }

  @Get('deployments/:id')
  findOne(@Param('id') id: string) {
    return this.deploymentsService.findOne(id);
  }
}
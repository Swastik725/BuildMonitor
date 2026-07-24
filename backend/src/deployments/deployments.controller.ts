import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { DeploymentsService } from './deployments.service';
import { TriggerDeploymentDto } from './dto/trigger-deployment.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class DeploymentsController {
  constructor(
    private readonly deploymentsService: DeploymentsService,
  ) {}

  @Post('projects/:projectId/deployments')
  trigger(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Body() dto: TriggerDeploymentDto,
  ) {
    return this.deploymentsService.trigger(
      projectId,
      user.id,
      dto,
    );
  }

  @Get('projects/:projectId/deployments')
  findAllByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
  ) {
    return this.deploymentsService.findAllByProject(
      projectId,
      user.id,
    );
  }

  @Get('deployments')
  findAllRecent(
    @CurrentUser() user: any,
  ) {
    return this.deploymentsService.findAllRecent(user.id);
  }

  @Get('deployments/:id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.deploymentsService.findOne(
      id,
      user.id,
    );
  }

  @Get('deployments/:id/logs')
  findLogs(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.deploymentsService.findLogs(
      id,
      user.id,
    );
  }

  @Patch('deployments/:id/retry')
  retry(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.deploymentsService.retry(id, user.id);
  }

  @Patch('deployments/:id/cancel')
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.deploymentsService.cancel(id, user.id);
  }
}
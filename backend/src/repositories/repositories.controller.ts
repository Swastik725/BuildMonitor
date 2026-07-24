import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RepositoriesService } from './repositories.service';
import { ConnectRepositoryDto } from './dto/connect-repository.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/repository')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Get()
  findOne(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.repositoriesService.findOne(projectId, user.id);
  }

  @Post('connect')
  connect(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ConnectRepositoryDto,
  ) {
    return this.repositoriesService.connect(projectId, user.id, dto);
  }

  @Post('sync')
  sync(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.repositoriesService.sync(projectId, user.id);
  }

  @Delete()
  disconnect(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.repositoriesService.disconnect(projectId, user.id);
  }
}

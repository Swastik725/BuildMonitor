import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RepositoriesService } from './repositories.service';
import { ConnectRepositoryDto } from './dto/connect-repository.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Get('github/repositories')
  listAvailable(@CurrentUser() user: { id: string }) {
    return this.repositoriesService.listAvailable(user.id);
  }

  @Get('projects/:projectId/repository')
  findOne(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.repositoriesService.findOne(projectId, user.id);
  }

  @Post('projects/:projectId/repository/connect')
  connect(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ConnectRepositoryDto,
  ) {
    return this.repositoriesService.connect(projectId, user.id, dto);
  }

  @Post('projects/:projectId/repository/sync')
  sync(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.repositoriesService.sync(projectId, user.id);
  }

  @Delete('projects/:projectId/repository')
  disconnect(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.repositoriesService.disconnect(projectId, user.id);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() dto: CreateProjectDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.projectsService.findAll(req.user.userId, organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.findOne(id, req.user.userId);
  }
}
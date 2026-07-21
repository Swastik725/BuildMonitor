import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller()
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Post('projects/:projectId/incidents')
  create(
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentsService.create(
      projectId,
      req.user.userId,
      dto,
    );
  }

  @Get('incidents')
  findAllOpen(@Req() req: AuthenticatedRequest) {
    return this.incidentsService.findAllOpen(req.user.userId);
  }

  @Get('projects/:projectId/incidents')
  findAllByProject(
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.incidentsService.findAllByProject(
      projectId,
      req.user.userId,
    );
  }

  @Patch('incidents/:id/resolve')
  resolve(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.incidentsService.resolve(id, req.user.userId);
  }
}
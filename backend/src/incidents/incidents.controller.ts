import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Post('projects/:projectId/incidents')
  create(@Param('projectId') projectId: string, @Body() dto: CreateIncidentDto) {
    return this.incidentsService.create(projectId, dto);
  }

  @Get('incidents')
  findAllOpen() {
    return this.incidentsService.findAllOpen();
  }

  @Get('projects/:projectId/incidents')
  findAllByProject(@Param('projectId') projectId: string) {
    return this.incidentsService.findAllByProject(projectId);
  }

  @Patch('incidents/:id/resolve')
  resolve(@Param('id') id: string) {
    return this.incidentsService.resolve(id);
  }
 
}
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Post('projects/:projectId/incidents')
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentsService.create(
      projectId,
      user.id,
      dto,
    );
  }

  @Get('incidents')
  findAllOpen(@CurrentUser() user: { id: string }) {
    return this.incidentsService.findAllOpen(user.id);
  }

  @Get('projects/:projectId/incidents')
  findAllByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.incidentsService.findAllByProject(
      projectId,
      user.id,
    );
  }

  @Patch('incidents/:id/resolve')
  resolve(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.incidentsService.resolve(id, user.id);
  }
}

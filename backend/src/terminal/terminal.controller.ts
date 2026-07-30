import { Body, Controller, Delete, Get, Param, Post, Sse, MessageEvent, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TerminalService } from './terminal.service';
import { CreateTerminalSessionDto } from './dto/create-terminal-session.dto';
import { RunTerminalCommandDto } from './dto/run-terminal-command.dto';
import { Observable } from 'rxjs';

@UseGuards(JwtAuthGuard)
@Controller()
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Post('projects/:projectId/terminal/sessions')
  createSession(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTerminalSessionDto,
  ) {
    return this.terminalService.createSession(projectId, user.id, dto);
  }

  @Get('projects/:projectId/terminal/sessions')
  listSessions(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.terminalService.listSessions(projectId, user.id);
  }

  @Get('projects/:projectId/terminal/sessions/:sessionId')
  getSession(
    @Param('projectId') projectId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.terminalService.getSession(projectId, sessionId, user.id);
  }

  @Post('projects/:projectId/terminal/sessions/:sessionId/commands')
  runCommand(
    @Param('projectId') projectId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: RunTerminalCommandDto,
  ) {
    return this.terminalService.runCommand(projectId, sessionId, user.id, dto.command);
  }

  @Sse('projects/:projectId/terminal/sessions/:sessionId/commands/stream')
  streamCommand(
    @Param('projectId') projectId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
    @Query('command') command: string,
  ): Observable<MessageEvent> {
    return this.terminalService.streamCommand(projectId, sessionId, user.id, command);
  }

  @Post('projects/:projectId/terminal/sessions/:sessionId/close')
  closeSession(
    @Param('projectId') projectId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.terminalService.closeSession(projectId, sessionId, user.id);
  }

  @Delete('projects/:projectId/terminal/sessions/:sessionId')
  destroySession(
    @Param('projectId') projectId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.terminalService.destroySession(projectId, sessionId, user.id);
  }
}

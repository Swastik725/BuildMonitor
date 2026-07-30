import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CodeCheckerService } from './code-checker.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class CodeCheckerController {
  constructor(private readonly codeCheckerService: CodeCheckerService) {}

  @Post('projects/:projectId/code-check')
  check(@Param('projectId') projectId: string, @CurrentUser() user: { id: string }) {
    return this.codeCheckerService.check(projectId, user.id);
  }

  @Get('projects/:projectId/code-check/history')
  history(@Param('projectId') projectId: string, @CurrentUser() user: { id: string }) {
    return this.codeCheckerService.history(projectId, user.id);
  }
}

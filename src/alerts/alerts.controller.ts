import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertsService } from './alerts.service';

@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('resolved') resolved?: string,
  ) {
    return this.alertsService.list(user.id, resolved === 'true');
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.alertsService.resolve(id, user.id);
  }
}

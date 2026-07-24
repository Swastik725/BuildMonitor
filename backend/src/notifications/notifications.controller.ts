import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  findAll(@CurrentUser() user: { id: string }) {
    return this.notificationsService.list(user.id);
  }

  @Patch('notifications/:id/read')
  markRead(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.notificationsService.markRead(id, user.id);
  }
}

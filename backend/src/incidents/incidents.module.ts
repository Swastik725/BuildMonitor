import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';

@Module({
  imports: [NotificationsModule],
  providers: [IncidentsService],
  controllers: [IncidentsController],
})
export class IncidentsModule {}

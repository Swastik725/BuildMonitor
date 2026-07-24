import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [DeploymentsController],
  providers: [DeploymentsService],
})
export class DeploymentsModule {}

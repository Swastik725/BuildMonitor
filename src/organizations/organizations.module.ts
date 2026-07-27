import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  imports: [AuthModule],
})
export class OrganizationsModule {}
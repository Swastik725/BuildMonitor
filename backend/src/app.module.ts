import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { HealthChecksModule } from './health-checks/health-checks.module';
import { IncidentsModule } from './incidents/incidents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    DeploymentsModule,
    HealthChecksModule,
    IncidentsModule,
  ],
})
export class AppModule {}
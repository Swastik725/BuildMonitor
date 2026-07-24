import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthChecksModule } from './health/health.module';
import { IncidentsModule } from './incidents/incidents.module';
import { UsersModule } from './users/users.module';
import { RepositoriesModule } from './repositories/repositories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    ProjectsModule,
    OrganizationsModule,
    DeploymentsModule,
    DashboardModule,
    HealthChecksModule,
    IncidentsModule,
    UsersModule,
    RepositoriesModule,
  ],
})
export class AppModule {}

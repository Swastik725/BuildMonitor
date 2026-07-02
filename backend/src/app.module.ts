import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AppController } from './app.controller';
import { HealthController } from "./health/health.controller";
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProjectsModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    
  ],
  
  controllers: [AppController, HealthController],
})
export class AppModule {}
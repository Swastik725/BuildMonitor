import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [ProjectsModule, OrganizationsModule, AuthModule,
     ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Registers the default Redis connection that all BullMQ queues
    // and workers in the app will use, unless overridden per-queue.
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),

    PrismaModule,

  ],
})
export class AppModule {}

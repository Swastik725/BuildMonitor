import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
// Custom generated client path — matches generator.output in schema.prisma
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    // Prisma 7 driver-adapter pattern: instead of Prisma managing its own
    // connection internally, we hand it a `pg` Pool wrapped in PrismaPg.
    // This is what lets Prisma work with edge/serverless-style drivers,
    // and it's also why the datasource url now lives in prisma.config.ts
    // rather than being read automatically from schema.prisma.
    const adapter = new PrismaPg({
      connectionString: config.get<string>('DATABASE_URL'),
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

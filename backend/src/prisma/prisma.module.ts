import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() means every other module in the app can inject PrismaService
// without needing to import PrismaModule themselves. Since almost every
// feature module (projects, deployments, health checks...) needs DB access,
// this saves repeating `imports: [PrismaModule]` everywhere.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

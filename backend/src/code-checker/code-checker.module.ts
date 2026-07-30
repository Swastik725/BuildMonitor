import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CodeCheckerController } from './code-checker.controller';
import { CodeCheckerService } from './code-checker.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CodeCheckerController],
  providers: [CodeCheckerService],
})
export class CodeCheckerModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TerminalController } from './terminal.controller';
import { TerminalService } from './terminal.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [TerminalController],
  providers: [TerminalService],
})
export class TerminalModule {}

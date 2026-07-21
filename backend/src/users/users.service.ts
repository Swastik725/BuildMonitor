import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    const { passwordHash, ...safe } = user;
    return safe;
  }

  getAuthProviders(userId: string) {
    return this.prisma.authProvider.findMany({
      where: { userId },
      select: { id: true, provider: true, createdAt: true },
    });
  }

  async disconnectProvider(userId: string, provider: string) {
    const providers = await this.prisma.authProvider.findMany({ where: { userId } });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Don't let someone lock themselves out — must keep at least one way to log in
    // (either a password, or another linked provider).
    const wouldHaveNoOtherLogin = providers.length <= 1 && !user?.passwordHash;
    if (wouldHaveNoOtherLogin) {
      throw new BadRequestException('Cannot disconnect your only login method');
    }

    const target = providers.find(p => p.provider === provider);
    if (!target) throw new NotFoundException(`${provider} is not connected`);

    await this.prisma.authProvider.delete({ where: { id: target.id } });
    return { disconnected: provider };
  }

  getSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, expiresAt: true },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.refreshToken.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }
    await this.prisma.refreshToken.update({ where: { id: sessionId }, data: { revoked: true } });
    return { revoked: true };
  }
}
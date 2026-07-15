import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        fullName: dto.fullName,
        authProviders: {
          create: { provider: 'local', providerId: dto.email },
        },
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    return this.generateTokens(user.id, user.email);
  }

  async generateTokens(userId: string, email: string) {
    const accessSecret = process.env.JWT_ACCESS_SECRET as string;
    const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
    const accessExpiry = process.env.JWT_ACCESS_EXPIRY as string;
    const refreshExpiry = process.env.JWT_REFRESH_EXPIRY as string;

    const accessToken = this.jwt.sign(
      { sub: userId, email },
      {
        secret: accessSecret,
        expiresIn: accessExpiry as any,
      },
    );

    const refreshToken = this.jwt.sign(
      { sub: userId },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiry as any,
      },
    );

    // Store a hash of the refresh token (never the raw token) for revocation support
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // should match JWT_REFRESH_EXPIRY

    await (this.prisma as any).refreshToken.create({
      data: { tokenHash, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      }) as { sub: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = crypto.createHash('sha256').update(dto.refreshToken).digest('hex');

    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, userId: payload.sub },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token no longer valid');
    }

    // Revoke the used token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.generateTokens(user.id, user.email);
  }

  async validateOAuthUser(profile: {
  providerId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}, provider: 'google' | 'github') {
  const existingAuth = await this.prisma.authProvider.findUnique({
    where: { provider_providerId: { provider, providerId: profile.providerId } },
    include: { user: true },
  });

  if (existingAuth) {
    return this.generateTokens(existingAuth.user.id, existingAuth.user.email);
  }

  // Check if a user with this email already exists (e.g. registered via email/password)
  let user = await this.prisma.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    user = await this.prisma.user.create({
      data: {
        email: profile.email,
        username: profile.email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 7),
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        emailVerified: true,
      },
    });
  }

  // Link this provider to the (existing or newly created) user
  await this.prisma.authProvider.create({
    data: { provider, providerId: profile.providerId, userId: user.id },
  });

  return this.generateTokens(user.id, user.email);
}
}


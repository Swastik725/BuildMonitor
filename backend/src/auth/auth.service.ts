import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
}
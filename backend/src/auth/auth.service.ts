import {ConflictException,Injectable} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
) {}
  

  async register(registerDto: RegisterDto) {
    const existingEmail = await this.usersService.findByEmail(registerDto.email);

    if (existingEmail) {
      throw new ConflictException('Email is already registered.');
    }

    const existingUsername = await this.usersService.findByUsername(registerDto.username);

    if (existingUsername) {
      throw new ConflictException('Username is already taken.');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        fullName: registerDto.fullName,
        passwordHash,
      },
    });

    return {
      message: 'User registered successfully.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
    };
  }

  async login(loginDto: LoginDto) {
  const user = await this.usersService.findByEmail(loginDto.email);

  if (!user) {
    throw new UnauthorizedException('Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(
    loginDto.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password.');
  }

  const payload = {
    sub: user.id,
    email: user.email,
    username: user.username,
  };

  const token = await this.jwtService.signAsync(payload);

  return {
    accessToken: token,
  };
}

async googleLogin(user: any) {
  let existingUser = await this.usersService.findByEmail(user.email);

  if (!existingUser) {
    existingUser = await this.usersService.create({
      email: user.email,
      username: user.email.split('@')[0],
      fullName: user.fullName,
      passwordHash: '', // no password for OAuth users
    });
  }

  const token = await this.jwtService.signAsync({
    sub: existingUser.id,
    email: existingUser.email,
    username: existingUser.username,
  });

  return {
    accessToken: token,
  };
}
}
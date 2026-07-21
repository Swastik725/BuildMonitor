import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch()
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Get('auth-providers')
  getAuthProviders(@Req() req) {
    return this.usersService.getAuthProviders(req.user.userId);
  }

  @Delete('auth-providers/:provider')
  disconnectProvider(@Req() req, @Param('provider') provider: string) {
    return this.usersService.disconnectProvider(req.user.userId, provider);
  }

  @Get('sessions')
  getSessions(@Req() req) {
    return this.usersService.getSessions(req.user.userId);
  }

  @Delete('sessions/:id')
  revokeSession(@Req() req, @Param('id') id: string) {
    return this.usersService.revokeSession(req.user.userId, id);
  }
}
import { Controller, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch()
  updateProfile(@CurrentUser() user: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('auth-providers')
  getAuthProviders(@CurrentUser() user: { id: string }) {
    return this.usersService.getAuthProviders(user.id);
  }

  @Delete('auth-providers/:provider')
  disconnectProvider(@CurrentUser() user: { id: string }, @Param('provider') provider: string) {
    return this.usersService.disconnectProvider(user.id, provider);
  }

  @Get('sessions')
  getSessions(@CurrentUser() user: { id: string }) {
    return this.usersService.getSessions(user.id);
  }

  @Delete('sessions/:id')
  revokeSession(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.usersService.revokeSession(user.id, id);
  }
}

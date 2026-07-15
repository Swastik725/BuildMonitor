import { Body, Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport handles the redirect to Google — this method body never runs
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const tokens = await this.authService.validateOAuthUser(req.user, 'google');
    // Redirect to frontend with tokens (adjust URL to your actual frontend)
    res.redirect(
      `http://localhost:5173/oauth-success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }

  @Get('github')
@UseGuards(AuthGuard('github'))
githubAuth() {}

@Get('github/callback')
@UseGuards(AuthGuard('github'))
async githubAuthCallback(@Req() req, @Res() res: Response) {
  const tokens = await this.authService.validateOAuthUser(req.user, 'github');
  res.redirect(
    `http://localhost:5173/oauth-success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
  );
}
}

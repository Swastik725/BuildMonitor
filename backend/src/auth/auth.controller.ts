import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}



  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: any) {
    return req.user;
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() {
    // redirects to Google
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleCallback(@Req() req: any) {
    return this.authService.googleLogin(req.user);
    }

}
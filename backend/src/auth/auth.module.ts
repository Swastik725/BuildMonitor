import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
const AuthController: any = require('./auth.controller');
import { Module } from '@nestjs/common/decorators/modules/module.decorator';
@Module({
  imports: [JwtModule.register({})], // secrets passed per-sign call, so empty config here is fine
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
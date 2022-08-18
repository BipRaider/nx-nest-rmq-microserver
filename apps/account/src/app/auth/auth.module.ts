import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UserModule } from '../user/user.module';
import { getJWTConfig } from '../configs/jwt.config';

@Module({
  imports: [UserModule, JwtModule.registerAsync(getJWTConfig())],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

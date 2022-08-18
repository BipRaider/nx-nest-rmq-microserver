import { Body, Controller, ForbiddenException, Post, UnauthorizedException } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';

import { AccountLogin, AccountRegister } from '@purple/contracts';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly rmqServes: RMQService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.rmqServes.send<AccountRegister.Request, AccountRegister.Response>(AccountRegister.topic, dto, {
        headers: { requestId: '1' },
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new ForbiddenException(e.message);
      }
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.rmqServes.send<AccountLogin.Request, AccountLogin.Response>(AccountLogin.topic, dto);
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message);
      }
    }
  }
}

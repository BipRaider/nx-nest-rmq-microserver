import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { JWTAuthGuard } from '../guards/jwt.guard';
import { UserFromJWT } from '../guards/user.decorator';

import { IJWTPayload } from '@purple/interfaces';

@Controller('user')
export class UserController {
  @UseGuards(JWTAuthGuard)
  @Get('info')
  async info(@UserFromJWT() user: IJWTPayload) {
    return user;
  }

  @Cron('*/5 * * * * *')
  async cron() {
    Logger.log('Cron');
  }
  @Cron('45 */1 * * * *')
  async cron1() {
    Logger.log('Cron 2');
  }
}

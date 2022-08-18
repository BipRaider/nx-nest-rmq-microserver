import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';

import { AccountBuyCourse, AccountChangeProfile, AccountCheckPayment } from '@purple/contracts';

import { UserService } from './user.service';

@Controller()
export class UserCommands {
  constructor(private readonly userService: UserService) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic, {})
  async changeProfile(@Body() payload: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
    return await this.userService.changeProfile(payload);
  }

  @RMQValidate()
  @RMQRoute(AccountBuyCourse.topic, {})
  async buyCourse(@Body() payload: AccountBuyCourse.Request): Promise<AccountBuyCourse.Response> {
    return await this.userService.buyCourse(payload);
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic, {})
  async checkPayment(@Body() payload: AccountCheckPayment.Request): Promise<AccountCheckPayment.Response> {
    return await this.userService.checkPayment(payload);
  }
}

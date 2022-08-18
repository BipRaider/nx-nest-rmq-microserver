import { Controller, Logger } from '@nestjs/common';
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq';

import { AuthService } from './auth.service';
import { AccountLogin, AccountRegister } from '@purple/contracts';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RMQValidate()
  @RMQRoute(AccountRegister.topic, {})
  async register(dto: AccountRegister.Request, @RMQMessage msg: Message): Promise<AccountRegister.Response> {
    const rId = msg.properties?.headers['requestId'];
    Logger.log(rId);
    return await this.authService.register(dto);
  }

  @RMQValidate()
  @RMQRoute(AccountLogin.topic, {})
  async login(dto: AccountLogin.Request): Promise<AccountLogin.Response> {
    const { id } = await this.authService.validateUser(dto);
    return this.authService.login(id);
  }
}

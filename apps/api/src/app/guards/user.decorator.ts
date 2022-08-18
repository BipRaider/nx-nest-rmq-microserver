import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserFromJWT = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest()?.user;
  }
);

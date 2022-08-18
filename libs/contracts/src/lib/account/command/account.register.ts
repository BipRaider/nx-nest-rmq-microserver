import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

import { TopicCommand } from '@purple/interfaces';

export namespace AccountRegister {
  export const topic = TopicCommand.AccountRegister;

  export class Request {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    displayName?: string;
  }

  export class Response {
    email: string;
    id: string;
  }
}

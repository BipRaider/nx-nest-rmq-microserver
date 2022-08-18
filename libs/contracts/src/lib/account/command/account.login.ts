import { TopicCommand } from '@purple/interfaces';
import { IsEmail, IsString, MinLength } from 'class-validator';

export namespace AccountLogin {
  export const topic = TopicCommand.AccountLogin;

  export class Request {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
  }

  export class Response {
    access_token: string;
  }
}

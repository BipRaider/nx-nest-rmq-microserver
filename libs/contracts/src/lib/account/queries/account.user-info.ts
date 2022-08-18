import { IsString } from 'class-validator';

import { IUser, TopicQuery } from '@purple/interfaces';

export namespace AccountUserInfo {
  export const topic = TopicQuery.AccountUserInfo;

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    profile: Omit<IUser, 'password'>;
  }
}

import { IsString } from 'class-validator';

import { IUser, TopicCommand } from '@purple/interfaces';

export namespace AccountChangeProfile {
  export const topic = TopicCommand.AccountChangeProfile;

  export class Request {
    @IsString()
    id: string;

    @IsString()
    user: Pick<IUser, 'displayName'>;
  }

  export class Response {}
}

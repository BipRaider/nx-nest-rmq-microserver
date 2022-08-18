import { IsString } from 'class-validator';

import { IUserCourses, TopicQuery } from '@purple/interfaces';

export namespace AccountUserCourses {
  export const topic = TopicQuery.AccountUserCourses;

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    courses: IUserCourses[];
  }
}

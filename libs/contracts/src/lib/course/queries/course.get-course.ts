import { IsString } from 'class-validator';

import { ICourse, TopicQuery } from '@purple/interfaces';

export namespace CourseGetCourse {
  export const topic = TopicQuery.CourseGetCourse;

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    course: ICourse | null;
  }
}

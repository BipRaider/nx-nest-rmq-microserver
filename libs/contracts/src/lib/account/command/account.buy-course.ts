import { TopicCommand } from '@purple/interfaces';
import { IsString } from 'class-validator';

export namespace AccountBuyCourse {
  export const topic = TopicCommand.AccountBuyCourse;

  export class Request {
    @IsString()
    userId: string;

    @IsString()
    courseId: string;
  }

  export class Response {
    paymentLink: string;
  }
}

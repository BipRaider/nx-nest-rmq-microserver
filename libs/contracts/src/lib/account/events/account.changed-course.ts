import { PurchaseState, TopicEvent } from '@purple/interfaces';
import { IsString } from 'class-validator';

export namespace AccountChangedCourse {
  export const topic = TopicEvent.AccountChangedCourse;

  export class Request {
    @IsString()
    userId: string;

    @IsString()
    courseId: string;

    @IsString()
    state: PurchaseState;
  }
}

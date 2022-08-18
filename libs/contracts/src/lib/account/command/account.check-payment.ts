import { PaymentStatus, TopicCommand } from '@purple/interfaces';
import { IsString } from 'class-validator';

export namespace AccountCheckPayment {
  export const topic = TopicCommand.AccountCheckPayment;

  export class Request {
    @IsString()
    userId: string;

    @IsString()
    courseId: string;
  }

  export class Response {
    status: PaymentStatus;
  }
}

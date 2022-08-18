import { PaymentStatus } from '@purple/interfaces';
import { UserEntity } from '../../entities/user.entity';

import { BuyCourseSaga } from '../buy-course.saga';

/**
 * Pattern State:
 * @class
 * This class business logic abstract for buying courses.
 */
export abstract class BuyCourseSagaState {
  public saga: BuyCourseSaga;

  public setContext(saga: BuyCourseSaga): void {
    this.saga = saga;
  }

  public abstract pay(): Promise<{ paymentLink: string; user: UserEntity }>;
  public abstract checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }>;
  public abstract cancel(): Promise<{ user: UserEntity }>;
}

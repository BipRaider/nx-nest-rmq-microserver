import { PaymentStatus, PurchaseState } from '@purple/interfaces';

import { UserEntity } from '../../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';
import { ErrCanceledCheck } from './list.error';

/**
 * Pattern State:
 * @class
 * The business logic of this class cancels course fees.
 */
export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId);
    return this.saga.getState().pay();
  }
  public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    const course = this.saga.user.courses.find(c => c.courseId === this.saga.courseId);

    if (course?.purchaseState !== PurchaseState.Canceled) throw new Error(ErrCanceledCheck);

    return { status: PaymentStatus.Canceled, user: this.saga.user };
  }
  public async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return { user: this.saga.user };
  }
}

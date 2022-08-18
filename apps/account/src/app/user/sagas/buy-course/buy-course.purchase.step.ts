import { PaymentStatus, PurchaseState } from '@purple/interfaces';

import { UserEntity } from '../../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';
import { ErrPurchaseCancel, ErrPurchaseCheck, ErrPurchasePay } from './list.error';

/**
 * Pattern State:
 * @class
 * The business logic of this class to purchase courses.
 */
export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error(ErrPurchasePay);
  }

  public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    const course = this.saga.user.courses.find(c => c.courseId === this.saga.courseId);

    if (course?.purchaseState !== PurchaseState.Purchase) throw new Error(ErrPurchaseCheck);

    return { status: PaymentStatus.Success, user: this.saga.user };
  }

  public cancel(): Promise<{ user: UserEntity }> {
    throw new Error(ErrPurchaseCancel);
  }
}

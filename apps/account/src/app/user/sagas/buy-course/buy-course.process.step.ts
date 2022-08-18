import { PaymentCheck } from '@purple/contracts';
import { PaymentStatus, PurchaseState } from '@purple/interfaces';

import { UserEntity } from '../../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';
import { ErrProcessCancel, ErrProcessPay } from './list.error';

/**
 * Pattern State:
 * @class
 * The business logic of this class to test the course purchase process.
 */
export class BuyCourseSagaStateProcess extends BuyCourseSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error(ErrProcessPay);
  }

  public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    const { status } = await this.saga.rmqService.send<PaymentCheck.Request, PaymentCheck.Response>(
      PaymentCheck.topic,
      { userId: this.saga.user._id, courseId: this.saga.courseId },
    );

    if (status === PaymentStatus.Canceled) {
      this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
      return { user: this.saga.user, status: PaymentStatus.Canceled };
    }

    if (status === PaymentStatus.Success) {
      return { user: this.saga.user, status: PaymentStatus.Success };
    }

    this.saga.setState(PurchaseState.Purchase, this.saga.courseId);
    return { user: this.saga.user, status: PaymentStatus.Progress };
  }

  public cancel(): Promise<{ user: UserEntity }> {
    throw new Error(ErrProcessCancel);
  }
}

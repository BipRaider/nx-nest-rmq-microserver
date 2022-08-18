import { CourseGetCourse, PaymentGenerateLink } from '@purple/contracts';
import { PaymentStatus, PurchaseState } from '@purple/interfaces';

import { UserEntity } from '../../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';
import { ErrStartedPay, ErrStartedCheck } from './list.error';

/**
 * Pattern State:
 * @class
 * The business logic of this class to start buying courses.
 */
export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<CourseGetCourse.Request, CourseGetCourse.Response>(
      CourseGetCourse.topic,
      { id: this.saga.courseId },
    );

    if (!course) throw new Error(ErrStartedPay);

    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchase, this.saga.courseId);
      return { paymentLink: null, user: this.saga.user };
    }

    const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(
      PaymentGenerateLink.topic,
      {
        courseId: course._id,
        userId: this.saga.user._id,
        sum: course.price,
      },
    );

    this.saga.setState(PurchaseState.WaitingForPayment, course._id);

    return { paymentLink, user: this.saga.user };
  }

  public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    const course = this.saga.user.courses.find(c => c.courseId === this.saga.courseId);

    if (course?.purchaseState !== PurchaseState.Started) throw new Error(ErrStartedCheck);

    return { status: PaymentStatus.Progress, user: this.saga.user };
  }

  public async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return { user: this.saga.user };
  }
}

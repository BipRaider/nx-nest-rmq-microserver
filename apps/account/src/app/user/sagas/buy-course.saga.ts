import { RMQService } from 'nestjs-rmq';

import { PurchaseState } from '@purple/interfaces';

import { UserEntity } from '../entities/user.entity';
import {
  BuyCourseSagaState,
  BuyCourseSagaStateCanceled,
  BuyCourseSagaStateProcess,
  BuyCourseSagaStatePurchased,
  BuyCourseSagaStateStarted,
} from './buy-course';

export class BuyCourseSaga {
  public state: BuyCourseSagaState;

  constructor(public user: UserEntity, public courseId: string, public rmqService: RMQService) {
    //Base state of the saga
    this.setState(user.getCourseState(courseId), courseId);
  }
  /**
   * @returns Get state of the saga
   */
  public getState = (): BuyCourseSagaState => {
    return this.state;
  };
  /**
   * @param state It's state the course to which we need to change the state.
   * @param courseId  It's the course id that we needed to change the state.
   */
  public setState = (state: PurchaseState, courseId: string): void => {
    switch (state) {
      case PurchaseState.Started:
        this.state = new BuyCourseSagaStateStarted();
        break;

      case PurchaseState.WaitingForPayment:
        this.state = new BuyCourseSagaStateProcess();
        break;

      case PurchaseState.Purchase:
        this.state = new BuyCourseSagaStatePurchased();
        break;

      case PurchaseState.Canceled:
        this.state = new BuyCourseSagaStateCanceled();
        break;

      default:
        break;
    }

    this.state.setContext(this);
    this.user.setCourseStatus(courseId, state);
  };
}

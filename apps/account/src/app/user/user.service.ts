import { Injectable, NotFoundException } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';

import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { IUser, PaymentStatus } from '@purple/interfaces';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEventEmitter } from './user.event-emitter';

interface IChangeProfile {
  user: Pick<IUser, 'displayName'>;
  id: string;
}
interface IBuyCourse {
  userId: string;
  courseId: string;
}

interface ICheckPayment {
  userId: string;
  courseId: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmitter: UserEventEmitter,
  ) {}

  public changeProfile = async ({ user, id }: IChangeProfile) => {
    const existedUser = await this.userRepository.findUserById(id);

    if (!existedUser) throw new NotFoundException('User not found');

    const userEntity = new UserEntity(existedUser).updateProfile(user.displayName);

    await this.updateUser(userEntity);

    return {};
  };

  public buyCourse = async ({ userId, courseId }: IBuyCourse): Promise<{ paymentLink: string }> => {
    const existedUser = await this.userRepository.findUserById(userId);

    if (!existedUser) throw new NotFoundException('User not found');

    const userEntity = new UserEntity(existedUser);

    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);

    const { user, paymentLink } = await saga.getState().pay();

    await this.updateUser(user);

    return { paymentLink };
  };

  public checkPayment = async ({ userId, courseId }: ICheckPayment): Promise<{ status: PaymentStatus }> => {
    const existedUser = await this.userRepository.findUserById(userId);

    if (!existedUser) throw new NotFoundException('User not found');

    const userEntity = new UserEntity(existedUser);

    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);

    const { user, status } = await saga.getState().checkPayment();

    await this.updateUser(user);

    return { status };
  };

  //Private methods
  private updateUser = async (user: UserEntity) => {
    return Promise.all([this.userRepository.updateUser(user), this.userEventEmitter.handler(user)]);
  };
}

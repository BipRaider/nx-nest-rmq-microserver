import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RMQModule, RMQTestService, RMQService } from 'nestjs-rmq';
import { verify } from 'jsonwebtoken';

import { UserModule } from './user.module';
import { AuthModule } from '../auth/auth.module';
import { getMongoConfig } from '../configs/mongo.config';
import { UserRepository } from './repositories/user.repository';

import {
  AccountLogin,
  AccountRegister,
  AccountBuyCourse,
  CourseGetCourse,
  PaymentGenerateLink,
  AccountCheckPayment,
  PaymentCheck,
} from '@purple/contracts';
import { ErrProcessPay, ErrPurchaseCheck } from './sagas/buy-course/list.error';
import { PaymentStatus } from '@purple/interfaces';

const authLogin: AccountLogin.Request = {
  password: '123456789',
  email: 'a@aTest1.com',
};
const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'Test user account',
};
const courseId = '1';
describe('UserCommands:', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;
  let configService: ConfigService;
  let token: string;
  let userId: string;
  //Start app
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['envs/.account.env'] }),
        RMQModule.forTest({}),
        MongooseModule.forRootAsync(getMongoConfig()),
        UserModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    userRepository = app.get<UserRepository>(UserRepository);
    rmqService = app.get(RMQService);
    configService = app.get<ConfigService>(ConfigService);
    await app.init();

    //base params
    await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
      AccountRegister.topic,
      authRegister,
    );

    const { access_token } = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(
      AccountLogin.topic,
      authLogin,
    );
    token = access_token;
    const data = verify(token, configService.get('JWT_SECRET'));
    userId = data['id'];
  });
  //Start test
  // describe('changeProfile:', () => {
  //   it('test', async () => {
  //     console.dir('value');
  //   });
  // });

  describe('AccountBuyCourse:', () => {
    const paymentLink = 'paymentLink';
    beforeAll(() => {
      rmqService.mockReply<CourseGetCourse.Response>(CourseGetCourse.topic, {
        course: { _id: courseId, price: 1000 },
      });
      rmqService.mockReply<PaymentGenerateLink.Response>(PaymentGenerateLink.topic, { paymentLink });
    });

    it('buy course', async () => {
      const res = await rmqService.triggerRoute<AccountBuyCourse.Request, AccountBuyCourse.Response>(
        AccountBuyCourse.topic,
        { userId, courseId },
      );
      expect(res.paymentLink).toBeDefined();
      expect(res.paymentLink).toEqual(paymentLink);
    });

    it(`if ${ErrProcessPay}`, async () => {
      try {
        await rmqService.triggerRoute<AccountBuyCourse.Request, AccountBuyCourse.Response>(AccountBuyCourse.topic, {
          userId,
          courseId,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual(ErrProcessPay);
      }
    });
  });

  describe('checkPayment:', () => {
    it('if checkPayment is success', async () => {
      rmqService.mockReply<PaymentCheck.Response>(PaymentCheck.topic, { status: PaymentStatus.Success });

      const res = await rmqService.triggerRoute<AccountCheckPayment.Request, AccountCheckPayment.Response>(
        AccountCheckPayment.topic,
        { userId, courseId },
      );

      expect(res.status).toEqual(PaymentStatus.Success);
    });

    it('if checkPayment is progress', async () => {
      rmqService.mockReply<PaymentCheck.Response>(PaymentCheck.topic, { status: PaymentStatus.Progress });
      const res = await rmqService.triggerRoute<AccountCheckPayment.Request, AccountCheckPayment.Response>(
        AccountCheckPayment.topic,
        { userId, courseId },
      );

      expect(res.status).toEqual(PaymentStatus.Progress);
    });

    // it('if checkPayment is canceled', async () => {
    //   rmqService.mockReply<PaymentCheck.Response>(PaymentCheck.topic, { status: PaymentStatus.Canceled });

    //   const res = await rmqService.triggerRoute<AccountCheckPayment.Request, AccountCheckPayment.Response>(
    //     AccountCheckPayment.topic,
    //     { userId, courseId },
    //   );
    //   expect(res.status).toEqual(PaymentStatus.Canceled);
    // });
  });

  afterAll(async () => {
    await userRepository.deleteOne(authRegister.email);
    app.close();
  });
});

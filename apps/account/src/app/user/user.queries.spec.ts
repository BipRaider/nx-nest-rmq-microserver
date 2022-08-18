import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RMQModule, RMQTestService, RMQService } from 'nestjs-rmq';
import { verify } from 'jsonwebtoken';

import { UserRole } from '@purple/interfaces';
import { AccountLogin, AccountRegister, AccountUserInfo, AccountUserCourses } from '@purple/contracts';

import { AuthModule } from '../auth/auth.module';
import { getMongoConfig } from '../configs/mongo.config';
import { UserRepository } from './repositories/user.repository';
import { UserModule } from './user.module';

// import { UserEntity } from '../user/entities/user.entity';

const authLogin: AccountLogin.Request = {
  password: '123456789',
  email: 'a@aTest2.com',
};
const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'Test user account',
};

describe('UserQueries:', () => {
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
  /**
   * Start test
   */
  describe('AccountUserInfo:', () => {
    it('get user information by id', async () => {
      const res = await rmqService.triggerRoute<AccountUserInfo.Request, AccountUserInfo.Response>(
        AccountUserInfo.topic,
        { id: userId },
      );

      expect(res.profile.role).toEqual(UserRole.STUDENT);
      expect(res.profile.email).toEqual(authLogin.email);
      expect(res.profile.displayName).toEqual(authRegister.displayName);
    });
  });

  describe('AccountUserCourses:', () => {
    it('get a list of user courses by id', async () => {
      const res = await rmqService.triggerRoute<AccountUserCourses.Request, AccountUserCourses.Response>(
        AccountUserCourses.topic,
        { id: userId },
      );
      expect(res.courses).toBeDefined();
    });
  });

  afterAll(async () => {
    await userRepository.deleteOne(authRegister.email);
    app.close();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, INestApplication, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RMQModule, RMQTestService, RMQService } from 'nestjs-rmq';

// import * as BCJS from 'bcryptjs';

import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { getMongoConfig } from '../../app/configs/mongo.config';
import { UserRepository } from '../user/repositories/user.repository';

import { AccountLogin, AccountRegister } from '@purple/contracts';
// import { UserEntity } from '../user/entities/user.entity';
// import { User } from '../user/modules/user.model';

const authLogin: AccountLogin.Request = {
  password: '123456789',
  email: 'a@aTest.com',
};
const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'Test user account',
};

describe('AuthController with database:', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;

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
    app.init();
  });
  describe('Register:', () => {
    it('if user to registered:', async () => {
      // jest.spyOn(userRepository, 'findUserByEmail').mockImplementationOnce(() => null);
      // jest.spyOn(userRepository, 'createUser').mockImplementationOnce(async (user: UserEntity) => {
      //   return { _id: '1', email: user.email } as User;
      // });

      const res = await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
        AccountRegister.topic,
        authRegister,
      );

      expect(res.email).toEqual(authRegister.email);
      expect(res.id).toBeDefined();
    });

    it('if the user exists', async () => {
      try {
        await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(AccountLogin.topic, authLogin);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.message).toBe('Forbidden');
        expect(err.status).toBe(403);
      }
    });
  });

  describe('Login:', () => {
    it('if user to logged', async () => {
      // jest.spyOn(userRepository, 'findUserByEmail').mockImplementationOnce(async () => {
      //   return (await {
      //     _id: '1',
      //   }) as User;
      // });

      // jest.spyOn(BCJS, 'compare').mockImplementationOnce(async () => true);

      const res = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(
        AccountLogin.topic,
        authLogin,
      );

      expect(res.access_token).toBeDefined();
    });

    it('if the user is not found', async () => {
      const authLogin: AccountLogin.Request = {
        password: '123456789',
        email: 'a@aTestNotFound.com',
      };

      try {
        await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(AccountLogin.topic, authLogin);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toBe('Not Found Exception');
        expect(err.response).toEqual({ error: 'User not found' });
        expect(err.status).toBe(404);
      }
    });

    it('if the user password is wrong', async () => {
      const authLogin: AccountLogin.Request = {
        password: '1234567',
        email: 'a@aTest.com',
      };

      try {
        await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(AccountLogin.topic, authLogin);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toBe('Unauthorized Exception');
        expect(err.response).toEqual({ error: 'Password is not correct' });
        expect(err.status).toBe(401);
      }
    });
  });

  afterAll(async () => {
    await userRepository.deleteOne(authRegister.email);
    app.close();
  });
});

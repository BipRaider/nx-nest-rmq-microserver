import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RMQModule } from 'nestjs-rmq';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { getMongoConfig } from '../app/configs/mongo.config';
import { getRMQConfig } from './configs/rmq.config';

@Module({
  imports: [
    RMQModule.forRootAsync(getRMQConfig()),
    ConfigModule.forRoot({
      isGlobal: true, // указываем что смотреть глобальный
      envFilePath: ['envs/.account.env'], // указываем в какой фйл смотреть
    }), // получаем данны  дял конфигураций приложения из
    MongooseModule.forRootAsync(getMongoConfig()), // подключение к базе данных перед запуском всего предложения

    UserModule,
    AuthModule,
  ],
})
export class AppModule {}

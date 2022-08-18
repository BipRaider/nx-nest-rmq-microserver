import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { RMQModule } from 'nestjs-rmq';

import { getJWTConfig } from './configs/jwt.config';
import { getRMQConfig } from './configs/rmq.config';

import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['envs/.api.env'] }),
    JwtModule.registerAsync(getJWTConfig()),
    RMQModule.forRootAsync(getRMQConfig()),
    ScheduleModule.forRoot(),
    PassportModule,
  ],
  controllers: [AuthController, UserController],
  providers: [JwtStrategy],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { UserSchema, User, UserCourses, UserCursesSchema } from './modules/user.model';
import { UserRepository } from './repositories/user.repository';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { UserEventEmitter } from './user.event-emitter';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserCourses.name, schema: UserCursesSchema },
    ]),
  ],
  providers: [UserService, UserRepository, UserEventEmitter],
  exports: [UserRepository],
  controllers: [UserCommands, UserQueries],
})
export class UserModule {}

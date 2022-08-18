import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserRepository } from '../user/repositories/user.repository';
import { UserEntity } from '../user/entities/user.entity';

import { UserRole } from '@purple/interfaces';
import { AccountRegister } from '@purple/contracts';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  public register = async ({
    email,
    password,
    displayName,
  }: AccountRegister.Request): Promise<AccountRegister.Response> => {
    const oldUser = await this.userRepository.findUserByEmail(email);

    if (oldUser) throw new ForbiddenException();

    const newUserEntity = await new UserEntity({
      email,
      displayName,
      role: UserRole.STUDENT,
      password: '',
    }).setPassword(password);

    const newUser = await this.userRepository.createUser(newUserEntity);

    return { email: newUser.email, id: newUser._id };
  };

  public validateUser = async ({
    email,
    password,
  }: Pick<UserEntity, 'email' | 'password'>): Promise<{ id: string }> => {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) throw new NotFoundException({ error: 'User not found' });

    const userEntity = new UserEntity(user);
    const isCorrectPassword = await userEntity.validatePassword(password);
    if (!isCorrectPassword)
      throw new UnauthorizedException({ error: 'Password is not correct' });
    return { id: user._id };
  };

  public login = async (id: string): Promise<{ access_token: string }> => {
    return {
      access_token: await this.jwtService.signAsync({ id }),
    };
  };
}

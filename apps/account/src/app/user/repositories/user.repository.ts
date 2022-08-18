import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User } from '../modules/user.model';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  public createUser = async (user: UserEntity): Promise<User> =>
    new this.userModel(user).save();

  public findUserByEmail = async (email: string): Promise<User> =>
    this.userModel.findOne({ email }).exec();

  public findUserById = async (id: string): Promise<User> =>
    this.userModel.findById(id).exec();

  public updateUser = async ({ _id, ...rest }: UserEntity) =>
    this.userModel.updateOne({ _id }, { $set: { ...rest } }).exec();

  public deleteOne = async (email: string) =>
    this.userModel.deleteOne({ email }).exec();
}

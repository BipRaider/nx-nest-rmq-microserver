import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserEventEmitter {
  constructor(private readonly rmqService: RMQService) {}

  public handler = async ({ events }: UserEntity) => {
    for (const event of events) {
      await this.rmqService.notify(event.topic, event.data);
    }
    return;
  };
}

import { ConfigService, ConfigModule } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const getMongoConfig = (): MongooseModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      uri: configService.get('DATABASE_URL'),
      // uri: getMongoString(configService),
    }),
  };
};

// const getMongoString = (configService: ConfigService) => {

//   return (
//     'mongodb://' +
//     configService.get('MONGO_LOGIN') +
//     ':' +
//     configService.get('MONGO_PASSWORD') +
//     '@' +
//     configService.get('MONGO_HOST') +
//     ':' +
//     configService.get('MONGO_PORT') +
//     '/' +
//     configService.get('MONGO_DATABASE') +
//     '?authSource=' +
//     configService.get('MONGO_AUTH')
//   );
// };

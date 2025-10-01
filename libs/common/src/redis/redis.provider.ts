// libs/common/src/redis/redis.provider.ts
import { ConfigService } from '@nestjs/config';
import { connectRedis } from './redis.client';

export const RedisProvider = {
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    return connectRedis({
      url: config.getOrThrow<string>('REDIS_URI'),
      username: config.get<string>('REDIS_USERNAME'),
      password: config.get<string>('REDIS_PASSWORD'),
    });
  },
};

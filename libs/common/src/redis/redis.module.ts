// libs/common/src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';

@Global() // make it available everywhere
@Module({
  providers: [RedisProvider],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}

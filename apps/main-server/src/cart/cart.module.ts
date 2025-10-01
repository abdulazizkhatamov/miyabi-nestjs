import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ConfigService } from '@nestjs/config';
import { connectRedis } from '@app/common';

@Module({
  providers: [
    CartService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return connectRedis({
          url: config.getOrThrow<string>('REDIS_URI'),
          username: config.get<string>('REDIS_USERNAME'),
          password: config.get<string>('REDIS_PASSWORD'),
        });
      },
    },
  ],
  controllers: [CartController],
})
export class CartModule {}

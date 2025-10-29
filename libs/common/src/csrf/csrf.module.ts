// libs/common/src/csrf/csrf.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RedisModule } from '@app/common/redis/redis.module';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';
import { CsrfMiddleware } from './csrf.middleware';

@Module({
  imports: [RedisModule],
  controllers: [CsrfController],
  providers: [CsrfService],
  exports: [CsrfService],
})
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}

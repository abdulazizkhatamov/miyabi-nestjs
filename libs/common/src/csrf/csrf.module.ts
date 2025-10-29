// libs/common/src/csrf/csrf.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';
import { CsrfMiddleware } from './csrf.middleware';

@Module({
  controllers: [CsrfController],
  providers: [CsrfService],
  exports: [CsrfService],
})
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CsrfModule, PrismaModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { BannersModule } from './banners/banners.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { CartIdMiddleware } from './middleware/cart.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'public'),
      // exclude: ['/api*'],
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    PrismaModule,
    AuthModule,
    CartModule,
    BannersModule,
    CategoriesModule,
    ProductsModule,
    CsrfModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CartIdMiddleware).forRoutes('*');
  }
}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/common';
import { CategoriesModule } from './categories/categories.module';
import { ImagesModule } from './images/images.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { BannersModule } from './banners/banners.module';
import { CsrfModule } from './csrf/csrf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'public'),
      serveRoot: '/public',
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    PrismaModule,
    CsrfModule,
    AuthModule,
    CategoriesModule,
    ImagesModule,
    ProductsModule,
    BannersModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminServerModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CsrfModule, PrismaModule } from '@app/common';
import { CategoriesModule } from './categories/categories.module';
import { ImagesModule } from './images/images.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { BannersModule } from './banners/banners.module';

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
    CategoriesModule,
    ImagesModule,
    ProductsModule,
    BannersModule,
    CsrfModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminServerModule {}

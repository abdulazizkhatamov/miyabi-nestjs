import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BannersModule } from './banners/banners.module';
import { PrismaModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'public'),
      exclude: ['/api*'],
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    PrismaModule,
    BannersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

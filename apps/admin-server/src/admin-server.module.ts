import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CsrfModule } from './csrf/csrf.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CsrfModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminServerModule {}

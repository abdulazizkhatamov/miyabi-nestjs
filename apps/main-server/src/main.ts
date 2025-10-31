import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { connectRedis } from '@app/common';
import type { Express } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);
  const port = Number(config.getOrThrow<string>('MAIN_SERVER_PORT'));

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', 1);

  // ✅ 1. CORS must come before session
  app.enableCors({
    origin: [config.getOrThrow<string>('ALLOWED_ORIGIN')],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'Accept',
      'Authorization',
      'x-csrf-token',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  // ✅ 2. Other setup
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // ✅ 3. Redis + Session
  const redis = await connectRedis({
    url: config.getOrThrow<string>('REDIS_URL'),
    username: config.get<string>('REDIS_USERNAME'),
    password: config.get<string>('REDIS_PASSWORD'),
  });

  const isProduction = config.get<string>('NODE_ENV') === 'production';

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      // ✅ must be true if you want to issue session cookie before any writes
      saveUninitialized: false,
      store: new RedisStore({
        client: redis,
        prefix: config.get<string>('SESSION_FOLDER') ?? 'client_session:',
      }),
      cookie: {
        maxAge: Number(config.getOrThrow<string>('SESSION_MAX_AGE')),
        httpOnly: true,
        // ✅ only secure in production (HTTPS)
        secure: isProduction,
        // ✅ allow cross-origin
        sameSite: isProduction ? 'none' : 'lax',
      },
    }),
  );

  // ✅ 4. Swagger
  const documentConfig = new DocumentBuilder()
    .setTitle('Miyabi House Api')
    .setDescription('Miyabi House API')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port ?? 3000);
}
bootstrap();

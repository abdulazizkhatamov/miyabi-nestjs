import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { connectRedis, parseBoolean } from '@app/common';
import { csrfSynchronisedProtection } from './libs/csrf-sync';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = Number(config.getOrThrow<string>('MAIN_SERVER_PORT'));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // Sessions (unchanged)
  const redis = await connectRedis({
    url: config.getOrThrow<string>('REDIS_URI'),
    username: config.get<string>('REDIS_USERNAME'),
    password: config.get<string>('REDIS_PASSWORD'),
  });

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        client: redis,
        prefix: config.get<string>('SESSION_FOLDER') ?? 'sess:',
      }),
      cookie: {
        maxAge: Number(config.getOrThrow<string>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: config.getOrThrow<string>('SESSION_SAME_SITE') as
          | 'lax'
          | 'strict'
          | 'none',
      },
    }),
  );

  app.enableCors({
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN').split(', '),
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'Accept',
      'Authorization',
      'x-csrf-token',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.use(csrfSynchronisedProtection);

  const documentConfig = new DocumentBuilder()
    .setTitle('Miyabi House Api')
    .setDescription(
      'The starting Nest JS project API description for Miyabi House',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api', app, documentFactory);

  // ⬇️ Attach Redis microservice (Transport.REDIS)
  // You can use `url` (preferred) or host/port. URL example: redis://:password@localhost:6379

  await app.listen(port ?? 3000);
}
bootstrap();

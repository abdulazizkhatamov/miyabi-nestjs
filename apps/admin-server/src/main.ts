import { NestFactory } from '@nestjs/core';
import { AdminServerModule } from './app.module';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { RedisStore } from 'connect-redis';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { connectRedis } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AdminServerModule);
  const config = app.get(ConfigService);
  const port = Number(config.getOrThrow<string>('ADMIN_SERVER_PORT'));

  // ✅ 1. Enable CORS before session
  app.enableCors({
    credentials: true,
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN').split(','),
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'Accept',
      'Authorization',
      'x-csrf-token',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    exposedHeaders: ['Set-Cookie'],
  });

  // ✅ 2. Setup basic app configuration
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // ✅ 3. Connect to Redis for session storage
  const redis = await connectRedis({
    url: config.getOrThrow<string>('REDIS_URL'),
    username: config.get<string>('REDIS_USERNAME'),
    password: config.get<string>('REDIS_PASSWORD'),
  });

  const isProduction = config.get<string>('NODE_ENV') === 'production';

  // ✅ 4. Session configuration
  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      // ✅ must be true if you want to issue session cookie before any writes
      saveUninitialized: true,
      store: new RedisStore({
        client: redis,
        prefix: config.get<string>('SESSION_FOLDER') ?? 'admin_session:',
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

  // ✅ 5. Swagger docs
  const documentConfig = new DocumentBuilder()
    .setTitle('Miyabi House Admin API')
    .setDescription('NestJS API for Miyabi House Admin Panel')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api', app, documentFactory);

  // ✅ 6. Start server
  await app.listen(port ?? 3001);
}

bootstrap();

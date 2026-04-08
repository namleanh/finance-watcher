import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Simple CORS configuration - explicitly allowed origins
  app.enableCors({
    origin: [
      'https://finance-watcher.namle.us',
      'https://finance-watcher-jf23.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown properties
      forbidNonWhitelisted: false,
      transform: true,       // auto-transform types (string → number etc.)
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Finance Watcher API is LIVE and BOOTSTRAPPED on port ${port}`);
  console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();

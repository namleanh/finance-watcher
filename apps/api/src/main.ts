import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS — allow Next.js dev server and Vercel production
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://finance-watcher-web.vercel.app'],
    credentials: true,
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
  console.log(`🚀 Finance Watcher API running on http://localhost:${port}/api/v1`);
}

bootstrap();

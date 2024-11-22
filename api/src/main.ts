import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { PORT } from './shared/infrastructure/env';
import { AppModule } from './app.module';
import { LoggerMiddleware } from './shared/infrastructure/middlewares/logger/logger.middleware';
import { AllExceptionsFilter } from './shared/infrastructure/filters/logger/logger.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json());
  app.use(new LoggerMiddleware().use);
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API template')
    .setDescription('API para template de projetos')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(PORT);

  Logger.log(`🚀 API running on: ${await app.getUrl()}`);
  Logger.log(`📚 Swagger running on: ${await app.getUrl()}/api`);
}
bootstrap();

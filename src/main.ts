import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { config as dotenvConfig } from 'dotenv';

import { productionLogLevel } from './@constants';
import { AppModule } from './app.module';
dotenvConfig();

async function bootstrap() {
  console.log('Starting NestJS server... 🚀🚀🚀 ');
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? productionLogLevel
        : // TODO: add any other log level if needed
          [...productionLogLevel],
  });

  const config = new DocumentBuilder()
    .setTitle('Multichain crypto marketplace')
    .setDescription('REST API documentation')
    .setVersion('1.0.0')
    .addTag('Documentation')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: true,
    methods: ['POST', 'PUT', 'DELETE', 'GET', 'PATCH'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

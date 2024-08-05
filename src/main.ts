import './tools/copyAssets';
import './tools/check-enviroments';
import config from 'config';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { TransformationResponseInterceptor } from '@app/shared/interceptors/response.interceptor';
import { AppLogger } from '@libs/elasticsearch/app.logger';

const isProduction = () => {
  // return process.env.NODE_ENV === 'production';
  return true;
};

const nestHttpApplication = async <T>(moduleClass: T): Promise<INestApplication> => {
  return await NestFactory.create(moduleClass, {
    snapshot: true,
  });
};

const nestHttpsApplication = async <T>(moduleClass: T): Promise<INestApplication> => {
  const keyPath = path.join(__dirname, 'certs', 'key.pem');
  const certPath = path.join(__dirname, 'certs', 'cert.pem');

  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
  return await NestFactory.create(moduleClass, {
    httpsOptions,
    snapshot: true,
  });
};

const nestEnviromentApplication = async <T>(moduleClass: T): Promise<INestApplication> => {
  return isProduction()
    ? await nestHttpsApplication(moduleClass)
    : await nestHttpApplication(moduleClass);
};

export const nestApplication = async <T>(moduleClass: T): Promise<INestApplication> => {
  const app = await nestEnviromentApplication(moduleClass);
  app.use(cookieParser());
  app.use(express.json());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix(config.get('PREFIX'));
  app.useGlobalInterceptors(new TransformationResponseInterceptor());
  await app.listen(config.get('PORT'), () => {
    AppLogger.log(`Server is running on port ${config.get('PORT')}`);
  });

  return app;
};

async function bootstrap() {
  await nestApplication(AppModule);
}

bootstrap();

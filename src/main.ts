import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { Envconfig } from './tools/env.config';
import { GlobalResponseInterceptor } from './core/interceptors/response.interceptor';

const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

const nestHttpApplication = async <T>(
  moduleClass: T,
): Promise<INestApplication> => {
  return await NestFactory.create(moduleClass, {
    snapshot: true,
  });
};

const nestHttpsApplication = async <T>(
  moduleClass: T,
): Promise<INestApplication> => {
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

const nestEnviromentApplication = async <T>(
  moduleClass: T,
): Promise<INestApplication> => {
  return isProduction()
    ? await nestHttpsApplication(moduleClass)
    : await nestHttpApplication(moduleClass);
};

export const nestApplication = async <T>(
  moduleClass: T,
): Promise<INestApplication> => {
  const app = await nestEnviromentApplication(moduleClass);
  app.use(cookieParser());
  app.use(express.json());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix(Envconfig.PREFIX);
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  await app.listen(Envconfig.PORT, () => {
    console.log(
      `🌟 Server mode ${process.env.NODE_ENV} is running on port ${Envconfig.PORT} 🌟`,
    );
  });

  return app;
};

async function bootstrap() {
  await nestApplication(AppModule);
}

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception thrown:', error);
});

bootstrap();

import config from 'config';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { GlobalExceptionFilter } from '@app/shared/filters/exception.filter';
import { TransformationResponseInterceptor } from '@app/shared/interceptors/response.interceptor';

const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

const nestHttpApplication = async <T>(moduleClass: T): Promise<INestApplication> => {
  return await NestFactory.create(moduleClass, {
    snapshot: true
  });
};

const nestHttpsApplication = async <T>(moduleClass: T): Promise<INestApplication> => {
  const keyPath = path.join(__dirname, 'certs', 'key.pem');
  const certPath = path.join(__dirname, 'certs', 'cert.pem');

  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  return await NestFactory.create(moduleClass, {
    httpsOptions,
    snapshot: true
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
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(config.get('PREFIX'));
  app.useGlobalInterceptors(new TransformationResponseInterceptor());
  await app.listen(config.get('PORT'), () => {
    console.log(`Server is running on port ${config.get('PORT')}`);
  });

  return app;
};

async function bootstrap() {
  await nestApplication(AppModule);
}

bootstrap();

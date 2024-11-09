import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Envconfig } from 'src/tools/env.config';
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: Envconfig.DB_HOST,
      port: Envconfig.DB_PORT,
      username: Envconfig.DB_USERNAME,
      password: Envconfig.DB_PASSWORD,
      database: Envconfig.DB_NAME,
      synchronize: false,
      autoLoadEntities: true,
      logging: false,
    };
  }
}

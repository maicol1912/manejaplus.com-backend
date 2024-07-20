import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import config from 'config';
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: config.get('DATABASE.HOST'),
      port: config.get('DATABASE.PORT'),
      username: config.get('DATABASE.USERNAME'),
      password: config.get('DATABASE.PASSWORD'),
      database: config.get('DATABASE.DATABASE_NAME'),
      synchronize: true,
      autoLoadEntities: true,
      logging: false
    };
  }
}

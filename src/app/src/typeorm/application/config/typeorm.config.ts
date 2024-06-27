import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'manejaplus',
      password: 'manejaplus123',
      database: 'manejaplusdb',
      synchronize: true,
      autoLoadEntities: true,
      logging: true
    };
  }
}

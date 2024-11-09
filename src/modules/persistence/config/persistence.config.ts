import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Envconfig } from 'src/tools/env.config';
import * as path from 'path';

const BASE_DIR = path.join(__dirname, '..', 'persistence', 'entities');

export const getTypeOrmConfig = (tenant?: string): TypeOrmModuleOptions => {
  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: Envconfig.DB_HOST,
    port: Envconfig.DB_PORT,
    username: Envconfig.DB_USERNAME,
    password: Envconfig.DB_PASSWORD,
    database: Envconfig.DB_NAME,
    entities: [
      // Entidades públicas (siempre se cargan)
      path.join(BASE_DIR, 'public', '**', '*.entity{.ts,.js}'),
      path.join(BASE_DIR, 'custom-public', '**', '*.entity{.ts,.js}'),
      ...(tenant ? [path.join(BASE_DIR, 'custom', '**', '*.entity{.ts,.js}')] : []),
    ],
    migrations: [path.join(__dirname, '..', 'persistence', 'migrations', '**', '*{.ts,.js}')],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    schema: tenant || 'public',
  };

  return baseConfig;
};

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return getTypeOrmConfig();
  }
}

export const TypeOrmConfig = getTypeOrmConfig();
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@app/persistence/application/config/persistence.config';
import { PersistenceModule } from '@app/persistence/persistence.module';
import { AuthenticationModule } from '@app/authentication/authentication.module';
import { ProductsModule } from '@app/products/products.module';
import { GlobalExceptionFilter } from '@app/shared/filters/exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from '@app/users/users.module';
import { OrganizationModule } from '@app/organizations/organization.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    PersistenceModule,
    ProductsModule,
    UsersModule,
    AuthenticationModule,
    OrganizationModule,
    AuthenticationModule
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ]
})
export class AppModule {}

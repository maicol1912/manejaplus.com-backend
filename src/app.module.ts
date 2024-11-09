import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '@authentication/authentication.module';
import { APP_FILTER } from '@nestjs/core';
import { OrganizationModule } from '@organizations/organization.module';
import { TypeOrmConfigService } from '@persistence/config/persistence.config';
import { PersistenceModule } from '@persistence/persistence.module';
import { ProductsModule } from '@products/products.module';
import { GlobalExceptionHandler } from './core/exceptions/exception.handler';
import { UsersModule } from './modules/users/users.module';



@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    // ElasticSearchModule.forRoot(),
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
      useClass: GlobalExceptionHandler
    }
  ],
  exports: []
})
export class AppModule {}

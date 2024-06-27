import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ProductsModule } from '@app/products';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@app/typeorm/application/config/typeorm.config';
import { TypeormConnectionModule } from '@app/typeorm/typeorm.module';
import { AuthenticationModule } from '@app/authentication';
import { UsersModule } from '@app/organizations/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    TypeormConnectionModule,
    ProductsModule,
    UsersModule,
    AuthenticationModule
  ],
  controllers: [HealthController],
  providers: []
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ProductsModule } from '@app/products';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@app/typeorm/application/config/typeorm.config';
import { TypeormConnectionModule } from '@app/typeorm/typeorm.module';
import { UsersModule } from '@app/organizations';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    TypeormConnectionModule,
    ProductsModule,
    UsersModule
  ],
  controllers: [HealthController],
  providers: []
})
export class AppModule {}

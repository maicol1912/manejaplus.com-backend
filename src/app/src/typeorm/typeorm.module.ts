import { Module } from '@nestjs/common';
import { TenantService } from './application/services/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmController } from './infraestructure/adapters/web/controllers/typeorm.controller';

@Module({
  imports: [TypeOrmModule.forFeature(TenantService.loadEntitiesInSchemaPublic())],
  controllers: [TypeOrmController],
  providers: [TenantService]
})
export class TypeormConnectionModule {}

import { Module } from '@nestjs/common';
import { TenantService } from './application/services/tenant.service';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceController } from './infraestructure/adapters/web/controllers/persistence.controller';
import { TenantRepositoryImpl } from './infraestructure/adapters/persistence/repository/tenant.repository';
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature(TenantService.loadEntitiesInSchemaPublic())],
  controllers: [PersistenceController],
  providers: [TenantService, TenantRepositoryImpl],
  exports: [TenantService]
})
export class PersistenceModule {}

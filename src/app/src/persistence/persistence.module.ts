import { Module } from '@nestjs/common';
import { TenantService } from './application/services/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceController } from './infraestructure/adapters/web/controllers/persistence.controller';
import { TenantRepositoryImpl } from './infraestructure/adapters/persistence/repository/tenant.repository';

@Module({
  imports: [TypeOrmModule.forFeature(TenantService.loadEntitiesInSchemaPublic())],
  controllers: [PersistenceController],
  providers: [TenantService, TenantRepositoryImpl],
  exports: [TenantService]
})
export class PersistenceModule {}

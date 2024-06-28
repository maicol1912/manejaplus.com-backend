import { Module } from '@nestjs/common';
import { TenantService } from './application/services/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceController } from './infraestructure/adapters/web/controllers/persistence.controller';

@Module({
  imports: [TypeOrmModule.forFeature(TenantService.loadEntitiesInSchemaPublic())],
  controllers: [PersistenceController],
  providers: [TenantService]
})
export class PersistenceModule {}

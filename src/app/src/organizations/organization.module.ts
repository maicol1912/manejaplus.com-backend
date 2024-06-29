import { Module } from '@nestjs/common';
import { OrganizationController } from './infraestructure/web/controller/organization.controller';
import { OrganizationRepositoryImpl } from './infraestructure/persistence/repository/organization-impl.repository';
import { OrganizationService } from './application/service/organization.service';
import { PersistenceModule } from '@app/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [OrganizationController],
  providers: [OrganizationRepositoryImpl, OrganizationService]
})
export class OrganizationModule {}

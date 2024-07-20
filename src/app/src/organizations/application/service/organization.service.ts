import { OrganizationModel } from '@app/organizations/domain/model/organization.model';
import { OrganizationEntity } from '@app/organizations/infraestructure/persistence/entity/organization.entity';
import { OrganizationRepositoryImpl } from '@app/organizations/infraestructure/persistence/repository/organization-impl.repository';
import { TenantService } from '@app/persistence/application/services/tenant.service';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationService {
  constructor(
    private organizationRepository: OrganizationRepositoryImpl,
    private tenantService: TenantService
  ) {}

  public async createOrganization(
    organizationModel: OrganizationModel
  ): Promise<OrganizationModel> {
    organizationModel.tenant = await this.tenantService.createTenantClient(organizationModel);
    return SqlGlobalMapper.mapClass<OrganizationEntity, OrganizationModel>(
      await this.organizationRepository.createOrganization(
        SqlGlobalMapper.mapClass<OrganizationModel, OrganizationEntity>(organizationModel)
      ),
      { get: ['name'] }
    );
  }
}

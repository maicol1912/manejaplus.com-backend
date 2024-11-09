
import { Injectable } from '@nestjs/common';
import { OrganizationModel } from '@organizations/model/organization.model';
import { TenantService } from '@persistence/core/services/tenant.service';
import { OrganizationEntity } from '@persistence/entities/public/organization.entity';
import { OrganizationRepository } from '@persistence/repositories/organization.repository';
import { SqlGlobalMapper } from 'src/modules/common/data/mappers/sql.mapper';


@Injectable()
export class OrganizationService {
  constructor(
    private organizationRepository: OrganizationRepository,
    private tenantService: TenantService
  ) {}

  // public async createOrganization(
  //   organizationModel: OrganizationModel
  // ): Promise<OrganizationModel> {
  //   organizationModel.tenant = await this.tenantService.createTenantClient(organizationModel);
  //   return SqlGlobalMapper.mapClass<OrganizationEntity, OrganizationModel>(
  //     await this.organizationRepository.save(
  //       SqlGlobalMapper.mapClass<OrganizationModel, OrganizationEntity>(organizationModel)
  //     ),
  //     { get: ['name'] }
  //   );
  // }
}

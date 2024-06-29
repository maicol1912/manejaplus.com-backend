import { Controller, Post, Body } from '@nestjs/common';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { CreateOrganizationDto } from '../dto/organization.dto';
import { OrganizationModel } from '@app/organizations/domain/model/organization.model';
import { OrganizationService } from '@app/organizations/application/service/organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  public async createUser(@Body() createOrganizationDto: CreateOrganizationDto) {
    const create = await this.organizationService.createOrganization(
      SqlGlobalMapper.mapClass<CreateOrganizationDto, OrganizationModel>(createOrganizationDto)
    );
    return create;
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dtos/organization.dto';
import { OrganizationModel } from '../model/organization.model';
import { SqlGlobalMapper } from 'src/modules/common/data/mappers/sql.mapper';

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

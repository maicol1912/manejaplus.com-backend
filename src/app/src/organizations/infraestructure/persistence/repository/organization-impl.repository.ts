import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrganizationEntity } from '../entity/organization.entity';

@Injectable()
export class OrganizationRepositoryImpl {
  private organizationRepo: Repository<OrganizationEntity>;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.organizationRepo = this.dataSource.getRepository(OrganizationEntity);
  }

  public async createOrganization(
    organizationEntity: OrganizationEntity
  ): Promise<OrganizationEntity> {
    return await this.organizationRepo.save(organizationEntity);
  }

  public async getUserById(id: string): Promise<OrganizationEntity> {
    return await this.organizationRepo.findOneBy({ id });
  }
  async updateUser(
    id: string,
    organizationEntity: OrganizationEntity
  ): Promise<OrganizationEntity> {
    return this.organizationRepo.save({ ...organizationEntity, id });
  }
}

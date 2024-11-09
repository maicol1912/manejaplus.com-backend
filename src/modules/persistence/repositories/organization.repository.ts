import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../entities/custom/category.entity';
import { BaseRepository } from '../core/base.repository';
import { OrganizationEntity } from '../entities/public/organization.entity';


@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationEntity, 'id'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, OrganizationEntity, 'id');
  }
}

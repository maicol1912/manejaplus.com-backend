import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../entities/custom/category.entity';
import { BaseRepository } from '../core/base.repository';
import { OrganizationEntity } from '../entities/public/organization.entity';
import { OtpEntity } from '../entities/public/otp.entity';
import { PermissionEntity } from '../entities/public/permission.entity';


@Injectable()
export class PermissionRepository extends BaseRepository<PermissionEntity, 'id'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, PermissionEntity, 'id');
  }
}

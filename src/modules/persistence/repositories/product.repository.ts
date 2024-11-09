import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../entities/custom/category.entity';
import { BaseRepository } from '../core/base.repository';
import { OrganizationEntity } from '../entities/public/organization.entity';
import { OtpEntity } from '../entities/public/otp.entity';
import { PermissionEntity } from '../entities/public/permission.entity';
import { ProductEntity } from '../entities/custom/product.entity';


@Injectable()
export class ProductRepository extends BaseRepository<ProductEntity, 'id'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, ProductEntity, 'id');
  }
}

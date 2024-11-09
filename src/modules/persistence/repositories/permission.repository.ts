import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { BaseRepository } from '../core/base.repository';
import { PermissionEntity } from '../entities/public/permission.entity';


@Injectable()
export class PermissionRepository extends BaseRepository<PermissionEntity, 'id'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, PermissionEntity, 'id');
  }

  public async findPermissionsByIdsAndActive(ids: string[]): Promise<PermissionEntity[]> {
    const permissions = await this.findManyByField({
      id: In(ids),
      status: true
    });
    return permissions;
  }
}

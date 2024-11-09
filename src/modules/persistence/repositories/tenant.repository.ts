import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BaseRepository } from "../core/base.repository";
import { TenantEntity } from "../entities/public/tenant.entity";



@Injectable()
export class TenantRepository extends BaseRepository<TenantEntity, 'id'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, TenantEntity, 'id');
  }
}

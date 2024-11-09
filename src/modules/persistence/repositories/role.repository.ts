import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BaseRepository } from "../core/base.repository";
import { RoleEntity } from "../entities/public/role.entity";



@Injectable()
export class RoleRepository extends BaseRepository<RoleEntity, 'id'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, RoleEntity, 'id');
  }
}

import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BaseRepository } from "../core/base.repository";
import { UserEntity } from "../entities/public/user.entity";



@Injectable()
export class UserRepository extends BaseRepository<UserEntity, 'id'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, UserEntity, 'id');
  }
}

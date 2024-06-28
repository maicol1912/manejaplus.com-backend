import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserRepositoryImpl {
  private userRepo: Repository<UserEntity>;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.userRepo = this.dataSource.getRepository(UserEntity);
  }

  public async createUser(userEntity: UserEntity): Promise<UserEntity> {
    return await this.userRepo.save(userEntity);
  }
}

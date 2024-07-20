import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { UserModel } from '@app/users/domain/models/user.model';
import { AtLeastOneProperty } from '@app/shared/types/at-least-one-property';

@Injectable()
export class UserRepositoryImpl {
  private userRepo: Repository<UserEntity>;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.userRepo = this.dataSource.getRepository(UserEntity);
  }

  public async save(userEntity: UserEntity): Promise<UserEntity> {
    return await this.userRepo.save(userEntity);
  }

  public async getUserById(id: string): Promise<UserEntity> {
    return await this.userRepo.findOneBy({ id });
  }
  public async updateUser(id: string, userEntity: UserEntity): Promise<UserEntity> {
    return this.userRepo.save({ ...userEntity, id });
  }
  public async getUserByField(query: AtLeastOneProperty<UserEntity>): Promise<UserEntity> {
    const whereClause: FindOptionsWhere<UserEntity> = {};

    Object.keys(query).forEach(key => {
      if (this.userRepo.metadata.findColumnWithPropertyName(key)) {
        whereClause[key as keyof UserEntity] = query[key as keyof UserEntity];
      } else {
        console.warn(`La propiedad "${key}" no existe en UserEntity y será ignorada.`);
      }
    });

    if (Object.keys(whereClause).length === 0) {
      throw new Error('No se proporcionaron campos válidos para la búsqueda.');
    }

    return await this.userRepo.findOne({ where: whereClause });
  }
}

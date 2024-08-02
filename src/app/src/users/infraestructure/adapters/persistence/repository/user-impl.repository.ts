import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { AtLeastOneProperty } from '@app/shared/types/at-least-one-property';
import { BaseRepository } from '@app/persistence/infraestructure/adapters/persistence/repository/base.repository';

@Injectable()
export class UserRepositoryImpl extends BaseRepository<UserEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, UserEntity);
  }

  public async save(userEntity: UserEntity): Promise<UserEntity> {
    return this.getManager().save(UserEntity, userEntity);
  }

  public async getUserById(id: string): Promise<UserEntity> {
    return await this.repository.findOneBy({ id });
  }
  public async updateUser(id: string, userEntity: UserEntity): Promise<UserEntity> {
    return this.repository.save({ ...userEntity, id });
  }
  public async getUserByField(query: AtLeastOneProperty<UserEntity>): Promise<UserEntity> {
    const whereClause: FindOptionsWhere<UserEntity> = {};

    Object.keys(query).forEach(key => {
      if (this.repository.metadata.findColumnWithPropertyName(key)) {
        whereClause[key as keyof UserEntity] = query[key as keyof UserEntity];
      } else {
        console.warn(`La propiedad "${key}" no existe en UserEntity y será ignorada.`);
      }
    });

    if (Object.keys(whereClause).length === 0) {
      throw new Error('No se proporcionaron campos válidos para la búsqueda.');
    }

    return await this.repository.findOne({ where: whereClause });
  }
}

import { Injectable } from '@nestjs/common';
import { UserModel } from '../../domain/models/user.model';
import { UserRepositoryImpl } from '../../infraestructure/adapters/persistence/repository/user-impl.repository';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserEntity } from '../../infraestructure/adapters/persistence/entity/user.entity';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepositoryImpl) {}

  public async createUser(userModel: UserModel): Promise<UserModel> {
    console.log(userModel);
    await userModel.encriptPassword();
    return SqlGlobalMapper.mapClass<UserEntity, UserModel>(
      await this.userRepository.createUser(
        SqlGlobalMapper.mapClass<UserModel, UserEntity>(userModel)
      ),
      { get: ['name', 'email'] }
    );
  }
}

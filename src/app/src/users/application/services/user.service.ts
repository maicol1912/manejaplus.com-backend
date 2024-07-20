import { Injectable } from '@nestjs/common';
import { UserModel } from '../../domain/models/user.model';
import { UserRepositoryImpl } from '../../infraestructure/adapters/persistence/repository/user-impl.repository';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserEntity } from '../../infraestructure/adapters/persistence/entity/user.entity';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepositoryImpl) {}

  public async createUser(userModel: UserModel): Promise<UserModel> {
    await userModel.encriptPassword();
    return SqlGlobalMapper.mapClass<UserEntity, UserModel>(
      await this.userRepository.save(SqlGlobalMapper.mapClass<UserModel, UserEntity>(userModel)),
      { get: ['name', 'email'] }
    );
  }

  public async incrementAttempFailed(id: string) {
    const user = SqlGlobalMapper.mapClassMethod<UserEntity, UserModel>(
      await this.userRepository.getUserById(id),
      UserModel
    );
    user.incrementFailedAttempts();
    this.userRepository.updateUser(id, SqlGlobalMapper.mapClass<UserModel, UserEntity>(user));
  }
}

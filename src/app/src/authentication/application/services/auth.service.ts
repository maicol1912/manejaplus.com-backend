import { AssignRoleModel } from '@app/authentication/domain/models/assign-role.model';
import { PermissionModel } from '@app/authentication/domain/models/permission.model';
import { RoleModel } from '@app/authentication/domain/models/role.model';
import { AuthRepositoryImpl } from '@app/authentication/domain/repositories/auth.repository';
import { PermissionEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/permission.entity';
import { RoleEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/role.entity';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserModel } from '@app/users/domain/models/user.model';
import { UserEntity } from '@app/users/infraestructure/adapters/persistence/entity/user.entity';
import { UserRepositoryImpl } from '@app/users/infraestructure/adapters/persistence/repository/user-impl.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepositoryImpl,
    private userRepository: UserRepositoryImpl
  ) {}

  public async createPermission(permissionModel: PermissionModel) {
    return SqlGlobalMapper.mapClass<PermissionEntity, PermissionModel>(
      await this.authRepository.createPermission(
        SqlGlobalMapper.mapClass<PermissionModel, PermissionEntity>(permissionModel)
      )
    );
  }

  public async createRole(roleModel: RoleModel) {
    const permissions = await this.authRepository.findPermissionsByIds(roleModel.permissionsId);
    if (permissions.length != roleModel.permissionsId.length) {
      throw new Error('at least one permission is not allowed');
    }
    roleModel.permissions = permissions;

    return SqlGlobalMapper.mapClass<RoleEntity, RoleModel>(
      await this.authRepository.createRole(
        SqlGlobalMapper.mapClass<RoleModel, RoleEntity>(roleModel)
      ),
      { get: ['name', 'description'] }
    );
  }

  public async assignRole(assignRoleModel: AssignRoleModel): Promise<Partial<UserEntity>> {
    const { rolesId, userId } = assignRoleModel;

    const roles = await this.authRepository.findRolesByIds(assignRoleModel.rolesId);
    const user = await this.userRepository.getUserById(userId);

    if (roles.length != rolesId.length) {
      throw new Error('at least one roles is not allowed');
    }

    if (!user) {
      throw new Error('the user to assign role not exists');
    }

    user.roles = roles;

    return SqlGlobalMapper.mapClass<UserEntity, UserModel>(
      await this.userRepository.updateUser(userId, user)
    );
  }
}

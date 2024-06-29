import { Controller, Post, Body } from '@nestjs/common';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserService } from '@app/users/application/services/user.service';
import { UserModel } from '@app/users/domain/models/user.model';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { AuthService } from '@app/authentication/application/services/auth.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { PermissionModel } from '@app/authentication/domain/models/permission.model';
import { RoleModel } from '@app/authentication/domain/models/role.model';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { AssignRoleModel } from '@app/authentication/domain/models/assign-role.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('permission')
  public async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.authService.createPermission(
      SqlGlobalMapper.mapClass<CreatePermissionDto, PermissionModel>(createPermissionDto)
    );
  }

  @Post('role')
  public async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.authService.createRole(
      SqlGlobalMapper.mapClass<CreateRoleDto, RoleModel>(createRoleDto)
    );
  }

  @Post('assignRole')
  public async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.authService.assignRole(
      SqlGlobalMapper.mapClass<AssignRoleDto, AssignRoleModel>(assignRoleDto)
    );
  }
}

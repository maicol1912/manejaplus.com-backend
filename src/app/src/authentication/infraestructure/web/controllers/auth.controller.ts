import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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
import { LoginDto } from '../dto/login.dto';
import { LoginModel } from '@app/authentication/domain/models/login.dto';
import { Authenticated } from '../../adapters/auth/guards/auth.guard';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { NotificationService } from '@app/authentication/application/services/notification.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

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

  @Post('login')
  public async loginUser(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(SqlGlobalMapper.mapClass<LoginDto, LoginModel>(loginDto));
  }

  @Post('refresh-token')
  public async refreshToken(@Body() loginDto: LoginDto) {
    return this.authService.refreshToken(SqlGlobalMapper.mapClass<LoginDto, LoginModel>(loginDto));
  }

  @Get('verify-email/:token(*)')
  public async verifyEmail(@Param() tokenVerify: VerifyEmailDto) {
    const { token } = tokenVerify;
    return this.authService.verifyAccount(token);
  }

  @Post('send-otp')
  public async sendOtp() {
    return this.notificationService.makeCall();
  }

  @Get('gretting')
  @Authenticated()
  public async gretting() {
    return 'hello';
  }
}

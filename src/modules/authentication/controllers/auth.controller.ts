import { Controller, Post, Body, Get, UseGuards, Req, Param } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AssignRoleDto } from "../dtos/assign-role.dto";
import { CreatePermissionDto } from "../dtos/create-permission.dto";
import { CreateRoleDto } from "../dtos/create-role.dto";
import { LoginDto } from "../dtos/login.dto";
import { VerifyEmailDto } from "../dtos/verify-email.dto";
import { AssignRoleModel } from "../models/assign-role.model";
import { LoginModel } from "../models/login.model";
import { PermissionModel } from "../models/permission.model";
import { RoleModel } from "../models/role.model";
import { AuthService } from "../services/auth.service";
import { UserVerificationService } from "../services/verification.service";
import { SqlGlobalMapper } from "src/modules/common/data/mappers/sql.mapper";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,private readonly verificationService:UserVerificationService) {}

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
    return this.authService.login(SqlGlobalMapper.mapClass<LoginDto, LoginModel>(loginDto));
  }

  @Get('google-login')
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req: any) {}

  @Get('google-callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: any) {
    return this.authService.googleLogin(req);
  }

  @Post('refresh-token')
  public async refreshToken(@Body() loginDto: LoginDto) {
    return this.authService.refreshToken(SqlGlobalMapper.mapClass<LoginDto, LoginModel>(loginDto));
  }

  @Post('unlock-account')
  public async unlockAccount(@Body() loginDto: LoginDto) {
    return this.authService.unlockAccount(SqlGlobalMapper.mapClass<LoginDto, LoginModel>(loginDto));
  }

  @Get('verify-email/:token(*)')
  public async verifyEmail(@Param() tokenVerify: VerifyEmailDto) {
    const { token } = tokenVerify;
    return this.authService.verifyAccount(token);
  }

  @Get('unlock-account/:token(*)')
  public async unlockAccountToken(@Param() tokenVerify: VerifyEmailDto) {
    const { token } = tokenVerify;
    return this.verificationService.unlockAccount(token);
  }
}

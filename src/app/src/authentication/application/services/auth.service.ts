import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import config from 'config';
import { Transactional } from '@app/persistence/infraestructure/adapters/persistence/decorators/transactional.decorator';

import { PermissionModel } from '@app/authentication/domain/models/permission.model';
import { RoleModel } from '@app/authentication/domain/models/role.model';
import { AssignRoleModel } from '@app/authentication/domain/models/assign-role.model';
import { LoginModel } from '@app/authentication/domain/models/login.model';
import { UserModel } from '@app/users/domain/models/user.model';

import { PermissionEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/permission.entity';
import { RoleEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/role.entity';
import { UserEntity } from '@app/users/infraestructure/adapters/persistence/entity/user.entity';

import { UnauthorizedException } from '@nestjs/common';
import { AccountNotVerifiedException } from '@app/authentication/domain/exceptions/account-not-verified.exception';
import { AccountBlockedException } from '@app/authentication/domain/exceptions/account-blocked.exception';
import { OtpRequiredException } from '@app/authentication/domain/exceptions/otp-required.exception';
import { OtpWrongException } from '@app/authentication/domain/exceptions/otp-wrong.exception';
import { VerifingAccountException } from '@app/authentication/domain/exceptions/verifing-account.exception';
import { BadRequestException } from '@nestjs/common';

import { TYPE_OTP } from '@app/users/infraestructure/adapters/persistence/entity/otp.entity';
import { AtLeastOneProperty } from '@app/shared/types/at-least-one-property';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { GenericBuilder } from '@app/shared/classes/generic-mapper';
import { AuthRepositoryImpl } from '@app/authentication/domain/repositories/auth.repository';
import { UserRepositoryImpl } from '@app/users/infraestructure/adapters/persistence/repository/user-impl.repository';
import { OtpService } from '@app/users/application/services/otp.service';
import { EncryptionUtil } from '@app/shared/encryption/encryption';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepositoryImpl,
    private readonly userRepository: UserRepositoryImpl,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService
  ) {}

  public async createPermission(permissionModel: PermissionModel): Promise<PermissionModel> {
    const permissionEntity = SqlGlobalMapper.mapClass<PermissionModel, PermissionEntity>(
      permissionModel
    );

    const createdPermission = await this.authRepository.createPermission(permissionEntity);
    return SqlGlobalMapper.mapClass<PermissionEntity, PermissionModel>(createdPermission);
  }

  public async createRole(roleModel: RoleModel) {
    const permissions = await this.authRepository.findPermissionsByIds(roleModel.permissionsId);

    this.validatePermissions(permissions, roleModel.permissionsId);

    roleModel.permissions = permissions;

    return SqlGlobalMapper.mapClass<RoleEntity, RoleModel>(
      await this.authRepository.createRole(
        SqlGlobalMapper.mapClass<RoleModel, RoleEntity>(roleModel)
      ),
      { get: ['name', 'description'] }
    );
  }

  public async assignRole(assignRoleModel: AssignRoleModel): Promise<Partial<UserModel>> {
    const { rolesId, userId } = assignRoleModel;
    const roles = await this.authRepository.findRolesByIds(rolesId);
    const user = await this.userRepository.getUserById(userId);

    this.validateRoles(roles, rolesId);
    this.validateUser(user);

    user.roles = roles;
    return SqlGlobalMapper.mapClass<UserEntity, UserModel>(
      await this.userRepository.updateUser(userId, user)
    );
  }

  public async loginUser(loginModel: LoginModel): Promise<Record<string, any>> {
    const user = await this.validateUserCredentials(loginModel);
    await this.checkUserStatus(user);
    await this.handleOtpIfRequired(user, loginModel);
    return this.handleUserLogin(user);
  }

  public async unlockAccount(loginModel: LoginModel): Promise<Record<string, any>> {
    const user = await this.validateUserCredentials(loginModel);
    if (user.isVerified && user.isBlocked) {
      const token = await this.generateJwtToken({ ...user });

      return {
        callbackUrl: `https://maicoldev.tech:3001/manejaplusback/auth/unlock-account/${token}`,
      };
    }
    throw new BadRequestException('Account not valid to unlock');
  }

  public async googleLoginUser(req: any): Promise<Record<string, any>> {
    if (!req.user) {
      throw new BadRequestException('No user from Google');
    }

    const { email, name, id, provider } = req.user;
    let user = await this.userRepository.getUserByField({ email });

    if (!user) {
      user = await this.createGoogleUser(email, name, id, provider);
    }

    return this.handleUserLogin(SqlGlobalMapper.mapClass<UserEntity, UserModel>(user));
  }

  @Transactional()
  public async verifyAccount(token: string): Promise<Record<string, string>> {
    try {
      const decodedToken = await this.jwtService.decode(token);
      const { email, id } = decodedToken.sub;
      const userEntity = await this.userRepository.getUserByField({ email, id });

      if (!userEntity) {
        throw new VerifingAccountException();
      }

      userEntity.isVerified = true;
      const updatedUserEntity = await this.userRepository.save(userEntity);

      return {
        email: updatedUserEntity.email,
        name: updatedUserEntity.name,
      };
    } catch (error) {
      throw new VerifingAccountException();
    }
  }

  @Transactional()
  public async unlockAccountToken(token: string): Promise<Record<string, string>> {
    try {
      const decodedToken = await this.jwtService.decode(token);
      const { email, id } = decodedToken.sub;
      const userEntity = await this.userRepository.getUserByField({ email, id });

      if (!userEntity) {
        throw new VerifingAccountException();
      }

      userEntity.isBlocked = false;
      const updatedUserEntity = await this.userRepository.save(userEntity);

      return {
        email: updatedUserEntity.email,
        name: updatedUserEntity.name,
      };
    } catch (error) {
      throw new VerifingAccountException();
    }
  }

  public async refreshToken(loginModel: LoginModel): Promise<void> {
    const { email } = loginModel;
    const userEntity = await this.userRepository.getUserByField({ email });

    if (!userEntity || !userEntity.refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const { accessToken } = await this.generateJWTTokens({
        email: userEntity.email,
        id: userEntity.id,
      });
      userEntity.accessToken = accessToken;
      await this.userRepository.save(userEntity);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  public async generateJwtToken(data: Record<string, any>): Promise<string> {
    return this.jwtService.signAsync(
      { sub: { ...data } },
      { expiresIn: config.get<string>('AUTH.TIME_VERIFY_ACCOUNT') }
    );
  }

  private validatePermissions(permissions: PermissionEntity[], permissionsId: string[]): void {
    if (permissions.length !== permissionsId.length) {
      throw new Error('At least one permission is not allowed');
    }
  }

  private validateRoles(roles: RoleEntity[], rolesId: string[]): void {
    if (roles.length !== rolesId.length) {
      throw new Error('At least one role is not allowed');
    }
  }

  private validateUser(user: UserEntity): void {
    if (!user) {
      throw new Error('The user to assign role does not exist');
    }
  }

  private async validateUserCredentials(loginModel: LoginModel): Promise<UserModel> {
    const { email, password } = loginModel;
    const userEntity = await this.userRepository.getUserByField({ email });

    if (!userEntity || !(await EncryptionUtil.comparePasswords(password, userEntity.password))) {
      await this.handleFailedLoginAttempt(userEntity);
      throw new UnauthorizedException('The credentials are not valid');
    }

    return SqlGlobalMapper.mapClassMethod<UserEntity, UserModel>(userEntity, UserModel);
  }

  private async handleFailedLoginAttempt(userEntity: UserEntity): Promise<void> {
    if (userEntity) {
      const user = SqlGlobalMapper.mapClassMethod<UserEntity, UserModel>(userEntity, UserModel);
      user.incrementFailedAttempts();
      await this.userRepository.save(SqlGlobalMapper.mapClass<UserModel, UserEntity>(user));
    }
  }

  private async checkUserStatus(user: UserModel): Promise<void> {
    if (!user.isVerified) {
      throw new AccountNotVerifiedException();
    }
    if (user.isBlocked) {
      throw new AccountBlockedException();
    }
  }

  private async handleOtpIfRequired(user: UserModel, loginModel: LoginModel): Promise<void> {
    if (user.validateNeedOtpToLogin() && !loginModel.otpCode) {
      await this.otpService.sendOtpCode(TYPE_OTP.LOGIN_OTP, user);
      throw new OtpRequiredException();
    }

    if (user.validateNeedOtpToLogin() && loginModel.otpCode) {
      const isValid = await this.otpService.checkOtpCodeIsValid(
        TYPE_OTP.LOGIN_OTP,
        loginModel.otpCode,
        user.id
      );
      if (!isValid) {
        throw new OtpWrongException();
      }
    }
  }

  private async handleUserLogin(user: UserModel): Promise<Record<string, any>> {
    const { email, id } = user;
    const { accessToken, refreshToken } = await this.generateJWTTokens({ email, id });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.lastConnection = new Date();
    await this.userRepository.save(SqlGlobalMapper.mapClass<UserModel, UserEntity>(user));

    return {
      accessToken: EncryptionUtil.encryptString(accessToken),
      refreshToken: EncryptionUtil.encryptString(refreshToken),
    };
  }

  private async createGoogleUser(
    email: string,
    name: string,
    id: string,
    provider: string
  ): Promise<UserEntity> {
    const passwordEncoded = await EncryptionUtil.hashPassword(id);
    const newUser = GenericBuilder<UserModel>()
      .set('name', name.toUpperCase())
      .set('email', email.toLowerCase())
      .set('password', passwordEncoded)
      .set('maintainSession', true)
      .set('origin', provider)
      .build();

    const userEntity = SqlGlobalMapper.mapClass<UserModel, UserEntity>(newUser);
    return this.userRepository.save(userEntity);
  }

  private async generateJWTTokens(payload: AtLeastOneProperty<UserModel>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: { ...payload } },
      { expiresIn: config.get<string>('AUTH.TIME_ACCESS_TOKEN') }
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: { ...payload } },
      { expiresIn: config.get<string>('AUTH.TIME_REFRESH_TOKEN') }
    );

    return { accessToken, refreshToken };
  }
}

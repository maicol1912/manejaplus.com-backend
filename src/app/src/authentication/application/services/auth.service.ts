import config from 'config';
import { AssignRoleModel } from '@app/authentication/domain/models/assign-role.model';
import { LoginModel } from '@app/authentication/domain/models/login.dto';
import { PermissionModel } from '@app/authentication/domain/models/permission.model';
import { RoleModel } from '@app/authentication/domain/models/role.model';
import { AuthRepositoryImpl } from '@app/authentication/domain/repositories/auth.repository';
import { PermissionEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/permission.entity';
import { RoleEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/role.entity';
import { BcrypEncoder } from '@app/shared/encoders/password.encoder';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { AtLeastOneProperty } from '@app/shared/types/at-least-one-property';
import { UserModel } from '@app/users/domain/models/user.model';
import { UserEntity } from '@app/users/infraestructure/adapters/persistence/entity/user.entity';
import { UserRepositoryImpl } from '@app/users/infraestructure/adapters/persistence/repository/user-impl.repository';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountNotVerifiedException } from '@app/authentication/domain/exceptions/account-not-verified.exception';
import { VerifingAccountException } from '@app/authentication/domain/exceptions/verifing-account.exception';
import { ERRORS_DEFINED } from '../config/auth.constants';
import { AccountBlockedException } from '@app/authentication/domain/exceptions/account-blocked.exception';
import { OtpRequiredException } from '@app/authentication/domain/exceptions/otp-required.exception';
import { GenericBuilder } from '@app/shared/classes/generic-mapper';
import { CryptoLibrary } from '@app/shared/encoders/crypto.encoder';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepositoryImpl,
    private userRepository: UserRepositoryImpl,
    private otpService: OtpService,
    private jwtService: JwtService
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

  public async loginUser(loginModel: LoginModel): Promise<Record<string, any>> {
    const { email, password } = loginModel;

    const user = SqlGlobalMapper.mapClassMethod<UserEntity, UserModel>(
      await this.userRepository.getUserByField({ email }),
      UserModel
    );

    if (!user) {
      throw new UnauthorizedException('The credentials are not valid');
    }

    if (!(await BcrypEncoder.checkPasswordAreEquals(password, user.password))) {
      user.incrementFailedAttempts();
      await this.userRepository.save(SqlGlobalMapper.mapClass<UserModel, UserEntity>(user));
      throw new UnauthorizedException('The credentials are not valid');
    }

    if (!user.isVerified) {
      throw new AccountNotVerifiedException();
    }

    if (user.isBlocked) {
      throw new AccountBlockedException();
    }

    if (user.validateNeedOtpToLogin()) {
      const otp_code = await this.otpService.sendOtpToUser(email);
      user.otp = otp_code;
      await this.userRepository.save(SqlGlobalMapper.mapClass<UserModel, UserEntity>(user));
      return { action: 'OTP_REQUIRED' };
    }

    return this.handleUserLogin(user);
  }

  public async googleLoginUser(req: any): Promise<Record<string, any>> {
    if (!req.user) {
      throw new BadRequestException('No user from Google');
    }

    const { email, name, id, provider } = req.user;

    let user = await this.userRepository.getUserByField({ email });

    if (!user) {
      const passwordEncoded = await BcrypEncoder.passwordEncoder(id);
      const newUser = GenericBuilder<UserModel>()
        .set('name', name.toUpperCase())
        .set('email', email.toLowerCase())
        .set('password', passwordEncoded)
        .set('maintainSession', true)
        .set('origin', provider)
        .build();

      const userEntity = await this.userRepository.save(
        SqlGlobalMapper.mapClass<UserModel, UserEntity>(newUser)
      );

      const newuser = SqlGlobalMapper.mapClass<UserEntity, UserModel>(userEntity);
      return this.handleUserLogin(newuser);
    }

    return this.handleUserLogin(SqlGlobalMapper.mapClass<UserEntity, UserModel>(user));
  }

  private async handleUserLogin(user: UserModel): Promise<Record<string, any>> {
    const { email, id } = user;
    const { accessToken, refreshToken } = await this.generateJWTTokens({ email, id });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    await this.userRepository.save(SqlGlobalMapper.mapClass<UserModel, UserEntity>(user));

    return {
      accessToken: CryptoLibrary.encryptString(accessToken),
      refreshToken: CryptoLibrary.encryptString(refreshToken)
    };
  }

  public async generateJWTTokens(payload: AtLeastOneProperty<UserModel>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: { ...payload } },
      { expiresIn: config.get<string>('AUTH.TIME_ACCESS_TOKEN') }
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: { ...payload } },
      { expiresIn: config.get<string>('AUTH.TIME_ACCESS_TOKEN') }
    );

    return { accessToken, refreshToken };
  }

  public async verifyAccount(token: string): Promise<Record<string, string>> {
    try {
      const decodedToken = await this.jwtService.decode(token);
      const { email, id } = decodedToken;

      const userFoundByToken = await this.userRepository.getUserByField({ email, id });

      if (!userFoundByToken) {
        throw new VerifingAccountException();
      }

      userFoundByToken.isVerified = true;

      const userUpdated = await this.userRepository.save(userFoundByToken);
      return {
        email: userUpdated.email,
        name: userUpdated.name
      };
    } catch (error) {
      throw new VerifingAccountException();
    }
  }

  public async generateJwtToken(data: Record<string, any>): Promise<string> {
    const token = await this.jwtService.signAsync(
      { sub: { ...data } },
      { expiresIn: config.get<string>('AUTH.TIME_VERIFY_ACCOUNT') }
    );
    return token;
  }

  public async refreshToken(loginModel: LoginModel) {
    let { email } = loginModel;
    const userFound = await this.userRepository.getUserByField({ email });

    if (!userFound || !userFound.refreshToken) {
      throw new UnauthorizedException();
    }
    try {
      ({ email } = userFound);
      let { id } = userFound;
      const { accessToken } = await this.generateJWTTokens({ email, id });
      userFound.accessToken = accessToken;
      await this.userRepository.save(userFound);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}

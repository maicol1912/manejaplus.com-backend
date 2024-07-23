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

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepositoryImpl,
    private userRepository: UserRepositoryImpl,
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
    let { email, password } = loginModel;

    const userFoundByEmail = SqlGlobalMapper.mapClassMethod<UserEntity, UserModel>(
      await this.userRepository.getUserByField({ email }),
      UserModel
    );

    if (!userFoundByEmail) {
      throw new UnauthorizedException('The credentials is not valid');
    }

    if (!(await BcrypEncoder.checkPasswordAreEquals(password, userFoundByEmail.password))) {
      userFoundByEmail.incrementFailedAttempts();

      await this.userRepository.save(
        SqlGlobalMapper.mapClass<UserModel, UserEntity>(userFoundByEmail)
      );
      throw new UnauthorizedException('The credentials is not valid');
    }

    if (!userFoundByEmail.isVerified) {
      throw new AccountNotVerifiedException();
    }

    if (userFoundByEmail.isBlocked) {
      throw new AccountBlockedException();
    }

    if (userFoundByEmail.validateNeedOtpToLogin()) {
      throw new OtpRequiredException();
    }

    ({ email } = userFoundByEmail);
    let { id } = userFoundByEmail;

    const { accessToken, refreshToken } = await this.generateJWTTokens({ email, id });
    userFoundByEmail.accessToken = accessToken;
    userFoundByEmail.refreshToken = refreshToken;

    await this.userRepository.save(
      SqlGlobalMapper.mapClass<UserModel, UserEntity>(userFoundByEmail)
    );

    return {
      accessToken: CryptoLibrary.encryptString(accessToken),
      refreshToken: CryptoLibrary.encryptString(refreshToken)
    };
  }

  public async googleLoginUser(req: any) {
    if (!req.user) {
      return 'no user from google';
    }
    const { email, name, picture, id, provider } = req.user;

    const userFoundByEmail = await this.userRepository.getUserByField({ email });

    if (!userFoundByEmail) {
      const passwordEncoded = await BcrypEncoder.passwordEncoder(id);
      const userToSaveInDB = GenericBuilder<UserModel>()
        .set('name', name.toUpperCase())
        .set('email', email.toLowerCase())
        .set('password', passwordEncoded)
        .set('maintainSession', true)
        .set('origin', provider)
        .build();
      await this.userRepository.save(
        SqlGlobalMapper.mapClass<UserModel, UserEntity>(userToSaveInDB)
      );
    }
    let accessToken: string,
      refreshToken: string = null;

    if (userFoundByEmail) {
      const { email, id } = userFoundByEmail;
      ({ accessToken, refreshToken } = await this.generateJWTTokens({ email, id }));
      userFoundByEmail.accessToken = accessToken;
      userFoundByEmail.refreshToken = refreshToken;
      await this.userRepository.save(userFoundByEmail);
    } else {
      const userFoundByEmail = await this.userRepository.getUserByField({ email });
      ({ accessToken, refreshToken } = await this.generateJWTTokens({
        email: userFoundByEmail.email,
        id: userFoundByEmail.id
      }));

      userFoundByEmail.accessToken = accessToken;
      userFoundByEmail.refreshToken = refreshToken;
      await this.userRepository.save(userFoundByEmail);
    }
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

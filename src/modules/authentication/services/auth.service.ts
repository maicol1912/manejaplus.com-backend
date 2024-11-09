import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AtLeastOneProperty } from "src/core/types/least-one-propertie";
import { AccountBlockedException } from "../exceptions/account-blocked.exception";
import { AccountNotVerifiedException } from "../exceptions/account-not-verified.exception";
import { OtpRequiredException } from "../exceptions/otp-required.exception";
import { OtpWrongException } from "../exceptions/otp-wrong.exception";
import { AssignRoleModel } from "../models/assign-role.model";
import { LoginModel } from "../models/login.model";
import { PermissionModel } from "../models/permission.model";
import { RoleModel } from "../models/role.model";
import { OtpService } from "./otp.service";
import { Envconfig } from "src/tools/env.config";
import { PermissionService } from "./permission.service";
import { RoleService } from "./role.service";
import { UserVerificationService } from "./verification.service";
import { TokenService } from "./token.service";
import { TYPE_OTP } from "@persistence/entities/public/otp.entity";
import { UserEntity } from "@persistence/entities/public/user.entity";
import { UserRepository } from "@persistence/repositories/user.repository";
import { GenericBuilder } from "src/modules/common/data/mappers/generic-mapper";
import { SqlGlobalMapper } from "src/modules/common/data/mappers/sql.mapper";
import { Transactional } from "src/modules/common/decorators/transactional.decorador";
import { EncryptionUtil } from "src/modules/common/utils/encryptors/encrypter";
import { UserModel } from "src/modules/users/models/user.model";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UnlockAccountResponse {
  callbackUrl: string;
}
export interface GoogleUserDto {
  email: string;
  name: string;
  id: string;
  provider: string;
}
export interface UserVerificationResponse {
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionService: PermissionService,
    private readonly jwtService: JwtService,
    private readonly roleService: RoleService,
    private readonly otpService: OtpService,
    private readonly tokenService:TokenService,
    private readonly userVerificationService: UserVerificationService
  ) {}

  public async createPermission(permissionModel: PermissionModel): Promise<PermissionModel> {
    return this.permissionService.createPermission(permissionModel);
  }

  public async createRole(roleModel: RoleModel): Promise<Partial<RoleModel>> {
    return this.roleService.createRole(roleModel);
  }

  @Transactional()
  public async assignRole(assignRoleModel: AssignRoleModel): Promise<Partial<UserModel>> {
    const { rolesId, userId } = assignRoleModel;
    const roles = await this.roleService.findRolesByIds(rolesId);
    const user = await this.userRepository.findById(userId);

    this.roleService.validateRoles(roles, rolesId);
    this.validateUser(user);

    user.roles = roles;
    return SqlGlobalMapper.mapClass<UserEntity, UserModel>(
      await this.userRepository.update(userId, user)
    );
  }

  public async login(loginModel: LoginModel): Promise<AuthTokens> {
    const user = await this.validateUserCredentials(loginModel);
    await this.checkUserStatus(user);
    await this.handleOtpIfRequired(user, loginModel);
    return this.handleUserLogin(user);
  }

  public async unlockAccount(loginModel: LoginModel): Promise<UnlockAccountResponse> {
    const user = await this.validateUserCredentials(loginModel);
    
    if (!user.isVerified || !user.isBlocked) {
      throw new BadRequestException('Account not valid to unlock');
    }

    const token = await this.tokenService.generateVerificationToken({ ...user });
    return {
      callbackUrl: `${Envconfig.BASE_URL}/auth/unlock-account/${token}`,
    };
  }

  public async googleLogin(googleUser: GoogleUserDto): Promise<AuthTokens> {
    if (!googleUser) {
      throw new BadRequestException('No user from Google');
    }

    const user = await this.findOrCreateGoogleUser(googleUser);
    return this.handleUserLogin(SqlGlobalMapper.mapClass<UserEntity, UserModel>(user));
  }

  public async verifyAccount(token: string): Promise<UserVerificationResponse> {
    return this.userVerificationService.verifyAccount(token);
  }

  public async unlockAccountWithToken(token: string): Promise<UserVerificationResponse> {
    return this.userVerificationService.unlockAccount(token);
  }

  @Transactional()
  public async refreshToken(loginModel: LoginModel): Promise<void> {
    const { email } = loginModel;
    const user = await this.userRepository.findByField({ email });

    if (!user?.refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const { accessToken } = await this.tokenService.generateTokenPair({
        email: user.email,
        id: user.id,
      });
      user.accessToken = accessToken;
      await this.userRepository.save(user);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private validateUser(user: UserEntity): void {
    if (!user) {
      throw new Error('The user to assign role does not exist');
    }
  }

  private async validateUserCredentials(loginModel: LoginModel): Promise<UserModel> {
    const { email, password } = loginModel;
    const user = await this.userRepository.findByField({ email });

    if (!user || !(await EncryptionUtil.comparePasswords(password, user.password))) {
      await this.handleFailedLoginAttempt(user);
      throw new UnauthorizedException('The credentials are not valid');
    }

    return SqlGlobalMapper.mapClassMethod<UserEntity, UserModel>(user, UserModel);
  }

  private async handleFailedLoginAttempt(user: UserEntity): Promise<void> {
    if (user) {
      const userModel = SqlGlobalMapper.mapClassMethod<UserEntity, UserModel>(user, UserModel);
      userModel.incrementFailedAttempts();
      await this.userRepository.save(SqlGlobalMapper.mapClass<UserModel, UserEntity>(userModel));
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
    if (!user.validateNeedOtpToLogin()) {
      return;
    }

    if (!loginModel.otpCode) {
      await this.otpService.sendOtpCode(TYPE_OTP.LOGIN_OTP, user);
      throw new OtpRequiredException();
    }

    const isValid = await this.otpService.checkOtpCodeIsValid(
      TYPE_OTP.LOGIN_OTP,
      loginModel.otpCode,
      user.id
    );

    if (!isValid) {
      throw new OtpWrongException();
    }
  }

  private async handleUserLogin(user: UserModel): Promise<AuthTokens> {
    const { email, id } = user;
    const tokens = await this.tokenService.generateTokenPair({ email, id });

    user.accessToken = tokens.accessToken;
    user.refreshToken = tokens.refreshToken;
    user.lastConnection = new Date();
    await this.userRepository.save(SqlGlobalMapper.mapClass<UserModel, UserEntity>(user));

    return {
      accessToken: EncryptionUtil.encryptString(tokens.accessToken),
      refreshToken: EncryptionUtil.encryptString(tokens.refreshToken),
    };
  }

  private async findOrCreateGoogleUser(googleUser: GoogleUserDto): Promise<UserEntity> {
    const { email, name, id, provider } = googleUser;
    const existingUser = await this.userRepository.findByField({ email });

    if (existingUser) {
      return existingUser;
    }

    return this.createGoogleUser(email, name, id, provider);
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

  public async generateAccessToken(payload: Record<string, any>): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload },
      { expiresIn: Envconfig.AUTH_TIME_ACCESS_TOKEN }
    );
  }

  public async generateVerificationToken(payload: Record<string, any>): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload },
      { expiresIn: Envconfig.AUTH_TIME_VERIFY_ACCOUNT }
    );
  }

  public async generateTokenPair(payload: AtLeastOneProperty<UserModel>): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: payload },
        { expiresIn: Envconfig.AUTH_TIME_ACCESS_TOKEN }
      ),
      this.jwtService.signAsync(
        { sub: payload },
        { expiresIn: Envconfig.AUTH_TIME_REFRESH_TOKEN }
      )
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  public decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
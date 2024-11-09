import { AuthService } from "@authentication/services/auth.service";
import { TokenService } from "@authentication/services/token.service";
import { Injectable, BadRequestException } from "@nestjs/common";
import { UserEntity } from "@persistence/entities/public/user.entity";
import { UserRepository } from "@persistence/repositories/user.repository";
import { TYPE_EMAIL, COMMON_LOCALS } from "src/libs/mailer/email.type";
import { MailerService } from "src/libs/mailer/mailer.service";
import { SqlGlobalMapper } from "src/modules/common/data/mappers/sql.mapper";
import { Transactional } from "src/modules/common/decorators/transactional.decorador";
import { UserModel } from "../models/user.model";


@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
    private tokenService:TokenService,
    private mailerService: MailerService
  ) {}

  @Transactional()
  public async createUser(userModel: UserModel): Promise<UserModel> {
    const userFindByEmail = await this.userRepository.findByField({ email: userModel.email });

    if (userFindByEmail) {
      throw new BadRequestException('The email already exists');
    }
    await userModel.encriptPassword();

    const userSaved = await this.userRepository.save(
      SqlGlobalMapper.mapClass<UserModel, UserEntity>(userModel)
    );
    const { callbackUrl } = await this.generateLinkJwtToVerifyEmail(userSaved);

    await this.mailerService.sendEmail(userSaved.email, TYPE_EMAIL.VERIFY_ACCOUNT, {
      ...COMMON_LOCALS,
      ...userSaved,
      callbackUrl
    });

    return SqlGlobalMapper.mapClass<UserEntity, UserModel>(userSaved, { get: ['name', 'email'] });
  }

  public async incrementAttempFailed(id: string) {
    const user = SqlGlobalMapper.mapClassMethod<UserEntity, UserModel>(
      await this.userRepository.findById(id),
      UserModel
    );
    user.incrementFailedAttempts();
    this.userRepository.update(id, SqlGlobalMapper.mapClass<UserModel, UserEntity>(user));
  }

  private async generateLinkJwtToVerifyEmail(
    data: Record<string, any>
  ): Promise<Record<string, string>> {
    try {
      const token = await this.tokenService.generateAccessToken(data);

      return {
        callbackUrl: `https://maicoldev.tech:3001/manejaplusback/auth/verify-email/${token}`
      };
    } catch (error) {
      throw new BadRequestException('Error providing link verify email');
    }
  }
}

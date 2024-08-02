import { BadRequestException, Injectable } from '@nestjs/common';
import { UserModel } from '../../domain/models/user.model';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserEntity } from '../../infraestructure/adapters/persistence/entity/user.entity';
import { DataSource } from 'typeorm';
import { MailerService } from '@libs/mailer/mailer.service';
import { AuthService } from '@app/authentication/application/services/auth.service';
import { COMMON_LOCALS, TYPE_EMAIL } from '@libs/mailer/email.type';
import {
  TRANSACTION_MANAGER,
  Transactional
} from '@app/persistence/infraestructure/adapters/persistence/decorators/transactional.decorator';
import { UserRepositoryImpl } from '@app/users/infraestructure/adapters/persistence/repository/user-impl.repository';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepositoryImpl,
    @InjectDataSource() private dataSource: DataSource,
    private authService: AuthService,
    private mailerService: MailerService
  ) {}

  @Transactional()
  public async createUser(userModel: UserModel): Promise<UserModel> {
    const userFindByEmail = await this.userRepository.getUserByField({ email: userModel.email });

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

  private async generateLinkJwtToVerifyEmail(
    data: Record<string, any>
  ): Promise<Record<string, string>> {
    try {
      const token = await this.authService.generateJwtToken(data);

      return {
        callbackUrl: `https://maicoldev.tech:3001/manejaplusback/auth/verify-email/${token}`
      };
    } catch (error) {
      throw new BadRequestException('Error providing link verify email');
    }
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

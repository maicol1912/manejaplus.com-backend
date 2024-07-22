import { BadRequestException, Injectable } from '@nestjs/common';
import { UserModel } from '../../domain/models/user.model';
import { UserRepositoryImpl } from '../../infraestructure/adapters/persistence/repository/user-impl.repository';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserEntity } from '../../infraestructure/adapters/persistence/entity/user.entity';
import { DataSource } from 'typeorm';
import { MailerService } from '@libs/mailer/mailer.service';
import { AuthService } from '@app/authentication/application/services/auth.service';
import { COMMON_LOCALS, TYPE_EMAIL } from '@libs/mailer/email.type';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepositoryImpl,
    private datasource: DataSource,
    private authService: AuthService,
    private mailerService: MailerService
  ) {}

  public async createUser(userModel: UserModel): Promise<UserModel> {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const userFindByEmail = await this.userRepository.getUserByField({ email: userModel.email });

    if (userFindByEmail) {
      throw new BadRequestException('The email already exists');
    }
    try {
      await userModel.encriptPassword();

      const userSaved = await this.userRepository.save(
        SqlGlobalMapper.mapClass<UserModel, UserEntity>(userModel, { get: ['email', 'id'] })
      );
      const { callbackUrl } = await this.generateLinkJwtToVerifyEmail(userSaved);

      await this.mailerService.sendEmail(userSaved.email, TYPE_EMAIL.VERIFY_ACCOUNT, {
        ...COMMON_LOCALS,
        ...userSaved,
        callbackUrl
      });

      return SqlGlobalMapper.mapClass<UserEntity, UserModel>(userSaved, { get: ['name', 'email'] });
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('was unexpectly error to create account, retry late');
    } finally {
      await queryRunner.release();
    }
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

import config from 'config';
import { Injectable } from '@nestjs/common';
import { UserModel } from '../../domain/models/user.model';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserEntity } from '../../infraestructure/adapters/persistence/entity/user.entity';
import { MailerService } from '@libs/mailer/mailer.service';
import { COMMON_LOCALS, TYPE_EMAIL } from '@libs/mailer/email.type';
import { Transactional } from '@app/persistence/infraestructure/adapters/persistence/decorators/transactional.decorator';
import {
  OtpEntity,
  TYPE_OTP,
} from '@app/users/infraestructure/adapters/persistence/entity/otp.entity';
import { GenericBuilder } from '@app/shared/classes/generic-mapper';
import { OtpModel } from '@app/users/domain/models/otp.model';
import { OtpRepositoryImpl } from '@app/users/infraestructure/adapters/persistence/repository/otp-impl.repository';

@Injectable()
export class OtpService {
  constructor(
    private otpRepository: OtpRepositoryImpl,
    private mailerService: MailerService
  ) {}

  @Transactional()
  public async sendOtpCode(type: TYPE_OTP, userModel: UserModel) {
    const otpCode = this.generateOtp();

    const otpModel: OtpModel = GenericBuilder<OtpModel>()
      .set('typeOtp', type)
      .set('otp', otpCode)
      .set('user', SqlGlobalMapper.mapClass<UserModel, UserEntity>(userModel))
      .build();

    await this.otpRepository.save(SqlGlobalMapper.mapClass<OtpModel, OtpEntity>(otpModel));

    await this.mailerService.sendEmail(userModel.email, type, {
      ...COMMON_LOCALS,
      ...userModel,
      otpCode,
    });

    return SqlGlobalMapper.mapClass<UserModel, UserModel>(userModel, { get: ['name', 'email'] });
  }

  public async checkOtpCodeIsValid(typeOtp: TYPE_OTP, otpCode: string, userId: string) {
    const timeExpirationOtp = config.get<number>('AUTH.TIME_OTP_VALID');

    const lastOtpGeneratedByType = await this.otpRepository.findByType(typeOtp, userId);

    if (
      otpCode == lastOtpGeneratedByType.otp &&
      timeExpirationOtp < lastOtpGeneratedByType.createdAt.getTime() &&
      !lastOtpGeneratedByType.wasUsed
    ) {
      lastOtpGeneratedByType.wasUsed = true;
      await this.otpRepository.save(lastOtpGeneratedByType);
      return true;
    }
    return false;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

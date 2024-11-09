import { Injectable } from "@nestjs/common";
import { TYPE_OTP, OtpEntity } from "@persistence/entities/public/otp.entity";
import { UserEntity } from "@persistence/entities/public/user.entity";
import { OtpRepository } from "@persistence/repositories/otp.repository";
import { COMMON_LOCALS } from "src/libs/mailer/email.type";
import { MailerService } from "src/libs/mailer/mailer.service";
import { GenericBuilder } from "src/modules/common/data/mappers/generic-mapper";
import { SqlGlobalMapper } from "src/modules/common/data/mappers/sql.mapper";
import { Transactional } from "src/modules/common/decorators/transactional.decorador";
import { OtpModel } from "src/modules/users/models/otp.model";
import { UserModel } from "src/modules/users/models/user.model";
import { Envconfig } from "src/tools/env.config";

@Injectable()
export class OtpService {
  constructor(
    private otpRepository: OtpRepository,
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
    const timeExpirationOtp = Envconfig.AUTH_TIME_OTP_VALID;

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

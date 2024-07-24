import { AccountBlockedException } from '@app/authentication/domain/exceptions/account-blocked.exception';
import { AccountNotVerifiedException } from '@app/authentication/domain/exceptions/account-not-verified.exception';
import { LoginModel } from '@app/authentication/domain/models/login.dto';
import { BcrypEncoder } from '@app/shared/encoders/password.encoder';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserModel } from '@app/users/domain/models/user.model';
import { UserEntity } from '@app/users/infraestructure/adapters/persistence/entity/user.entity';
import { UserRepositoryImpl } from '@app/users/infraestructure/adapters/persistence/repository/user-impl.repository';
import { COMMON_LOCALS, TYPE_EMAIL } from '@libs/mailer/email.type';
import { MailerService } from '@libs/mailer/mailer.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import config from 'config';
import crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(private mailerService: MailerService) {}

  public async sendOtpToUser(email: string) {
    const otp_code = this.generateOtp();
    await this.mailerService.sendEmail(email, TYPE_EMAIL.SEND_OTP, {
      ...COMMON_LOCALS,
      otp_code
    });
    return otp_code;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

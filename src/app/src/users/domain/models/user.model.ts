import { PasswordEncoder } from '@app/shared/encoders/password.encoder';
import { USER_CONSTANTS } from '../../application/config/constant/user.constant';
import { AUTH_CONSTANTS } from '@app/authentication/application/config/auth.constants';

export class UserModel {
  public name: string;
  public email: string;
  public password: string;
  public phone: string;
  public id?: string;
  public otp?: string;
  public attemptsFailed: number;
  public isVerified: boolean;
  public isBlocked: boolean;
  public accessToken: string;
  public refreshToken: string;
  public status: boolean;
  public maintainSession: boolean;
  public lastConnection?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  public incrementFailedAttempts() {
    this.attemptsFailed++;
    if (this.attemptsFailed >= USER_CONSTANTS.NUMBER_ATTEMPS_TO_BLOCk_USER) {
      this.isBlocked = true;
    }
  }

  public validateNeedOtpToLogin() {
    if (!this.lastConnection) {
      return true;
    }
    const differenceLastConnection = new Date().getTime() - this.lastConnection.getTime();
    if (
      this.maintainSession &&
      differenceLastConnection > AUTH_CONSTANTS.TIME_TO_ASK_OTP_MAINTEIN_SESSION
    ) {
      return true;
    }
    if (differenceLastConnection > AUTH_CONSTANTS.TIME_TO_ASK_OTP) {
      return true;
    }
    return false;
  }
  public async encriptPassword() {
    this.password = await PasswordEncoder(this.password);
  }

  public verify() {
    this.isVerified = true;
  }
}

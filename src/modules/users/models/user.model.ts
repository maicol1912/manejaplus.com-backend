import { AUTH_CONSTANTS } from "src/core/constants/auth.constants";
import { USER_CONSTANTS } from "src/core/constants/user.constant";
import { EncryptionUtil } from "src/modules/common/utils/encryptors/encrypter";


export class UserModel {
  public id?: string;
  public name: string;
  public email: string;
  public password: string;
  public phone: string;
  public otp?: string;
  public attemptsFailed: number = 0;
  public isVerified: boolean = false;
  public isBlocked: boolean = false;
  public origin: string = 'web';
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
    this.password = await EncryptionUtil.hashPassword(this.password);
  }

  public verify() {
    this.isVerified = true;
  }
}

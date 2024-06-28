import { PasswordEncoder } from '@app/shared/encoders/password.encoder';
import { USER_CONSTANTS } from '../../application/config/constant/user.constant';

export class UserModel {
  public name: string;
  public email: string;
  public password: string;
  public phone: string;
  public id?: string;
  public otp?: string;
  public attemptsFailed: number = 0;
  public isVerified: boolean = false;
  public isBlocked: boolean = false;
  public status: boolean = true;
  public createdAt?: Date;
  public updatedAt?: Date;

  public incrementFailedAttempts() {
    this.attemptsFailed++;
    if (this.attemptsFailed >= USER_CONSTANTS.NUMBER_ATTEMPS_TO_BLOCk_USER) {
      this.isBlocked = true;
    }
  }

  public async encriptPassword() {
    this.password = await PasswordEncoder(this.password);
  }

  public verify() {
    this.isVerified = true;
  }
}

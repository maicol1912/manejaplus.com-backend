import { TYPE_OTP } from '@app/users/infraestructure/adapters/persistence/entity/otp.entity';
import { UserEntity } from '@app/users/infraestructure/adapters/persistence/entity/user.entity';

export class OtpModel {
  public id: string;
  public otp: string;
  public typeOtp: TYPE_OTP;
  public user: UserEntity;
  public wasUsed?: boolean;
  public createdAt: Date;
  public updatedAt: Date;
}

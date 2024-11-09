import { TYPE_OTP } from "@persistence/entities/public/otp.entity";
import { UserEntity } from "@persistence/entities/public/user.entity";


export class OtpModel {
  public id: string;
  public otp: string;
  public typeOtp: TYPE_OTP;
  public user: UserEntity;
  public wasUsed?: boolean;
  public createdAt: Date;
  public updatedAt: Date;
}

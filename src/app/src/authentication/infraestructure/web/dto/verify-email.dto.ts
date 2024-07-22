import { IsJWT } from 'class-validator';

export class VerifyEmailDto {
  @IsJWT()
  public token: string;
}

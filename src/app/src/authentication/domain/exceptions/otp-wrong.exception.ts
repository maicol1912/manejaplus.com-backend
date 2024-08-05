import { ERRORS_DEFINED } from '@app/authentication/application/config/auth.constants';
import { HttpException, HttpStatus } from '@nestjs/common';

export class OtpWrongException extends HttpException {
  constructor() {
    super(
      {
        message: ERRORS_DEFINED.OTP_WRONG,
      },
      HttpStatus.FORBIDDEN
    );
  }
}

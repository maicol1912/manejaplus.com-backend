import { ERRORS_DEFINED } from '@app/authentication/application/config/auth.constants';
import { HttpException, HttpStatus } from '@nestjs/common';

export class OtpRequiredException extends HttpException {
  constructor() {
    super(
      {
        message: ERRORS_DEFINED.OTP_REQUIRED
      },
      HttpStatus.FORBIDDEN
    );
  }
}

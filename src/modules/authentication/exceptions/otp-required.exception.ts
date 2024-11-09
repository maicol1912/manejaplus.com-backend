
import { HttpException, HttpStatus } from '@nestjs/common';
import { ERRORS_DEFINED } from 'src/core/constants/auth.constants';

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

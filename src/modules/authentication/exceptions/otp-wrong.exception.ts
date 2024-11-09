
import { HttpException, HttpStatus } from '@nestjs/common';
import { ERRORS_DEFINED } from 'src/core/constants/auth.constants';

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

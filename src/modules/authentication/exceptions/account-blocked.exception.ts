
import { HttpException, HttpStatus } from '@nestjs/common';
import { ERRORS_DEFINED } from 'src/core/constants/auth.constants';

export class AccountBlockedException extends HttpException {
  constructor() {
    super(
      {
        message: ERRORS_DEFINED.ACCOUNT_BLOCKED
      },
      HttpStatus.FORBIDDEN
    );
  }
}

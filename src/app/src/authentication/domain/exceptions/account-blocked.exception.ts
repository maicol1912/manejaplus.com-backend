import { ERRORS_DEFINED } from '@app/authentication/application/config/auth.constants';
import { HttpException, HttpStatus } from '@nestjs/common';

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

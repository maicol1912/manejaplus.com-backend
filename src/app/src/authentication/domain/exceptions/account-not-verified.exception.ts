import { ERRORS_DEFINED } from '@app/authentication/application/config/auth.constants';
import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountNotVerifiedException extends HttpException {
  constructor() {
    super(
      {
        message: ERRORS_DEFINED.ACCOUNT_NOT_VERIFIED
      },
      HttpStatus.FORBIDDEN
    );
  }
}

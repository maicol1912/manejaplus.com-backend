import { HttpException, HttpStatus } from '@nestjs/common';
import { ERRORS_DEFINED } from 'src/core/constants/auth.constants';

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

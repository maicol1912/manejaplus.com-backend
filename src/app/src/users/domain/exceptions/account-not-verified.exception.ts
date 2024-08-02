import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountNotVerifiedException extends HttpException {
  constructor() {
    super(
      {
        message: 'the Account is not verified yet.'
      },
      HttpStatus.FORBIDDEN
    );
  }
}

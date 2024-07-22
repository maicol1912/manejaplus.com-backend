import { HttpException, HttpStatus } from '@nestjs/common';

export class VerifingAccountException extends HttpException {
  constructor() {
    super(
      {
        message: 'Error verifing account try another time'
      },
      HttpStatus.FORBIDDEN
    );
  }
}

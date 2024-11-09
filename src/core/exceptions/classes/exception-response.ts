import { HttpException, HttpStatus } from '@nestjs/common';

export class ExceptionResponse extends HttpException {
  constructor(response: any, statusCode: HttpStatus) {
    super(response, statusCode);
  }
}

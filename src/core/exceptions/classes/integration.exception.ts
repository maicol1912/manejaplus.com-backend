import { HttpException, HttpStatus } from '@nestjs/common';

export class IntegrationException extends HttpException {
  constructor(response: any, statusCode: HttpStatus) {
    super(response, statusCode);
  }
}

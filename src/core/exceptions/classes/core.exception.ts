import { HttpException, HttpStatus } from '@nestjs/common';

export class CoreException extends HttpException {
  constructor(
    public readonly originalError: any,
    public readonly customMessage: string = 'An error occurred'
  ) {
    super(customMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = 'CoreException';
  }

  getAxiosErrorResponse() {
    if (this.originalError?.isAxiosError) {
      return {
        data: this.originalError.response?.data,
      };
    }
    return null;
  }
}

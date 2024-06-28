import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

type ResponseException = string | { message?: string; details?: string; [key: string]: any };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    console.error('exception ==> ', exception);

    const exceptionResponse: ResponseException =
      exception instanceof HttpException
        ? exception.getResponse()
        : Array.isArray(exception)
          ? exception
          : exception === undefined || exception === null
            ? { message: 'Error desconocido' }
            : String(exception);

    console.log('exceptionResponse', exceptionResponse);

    const isArrayError =
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse &&
      Array.isArray(exceptionResponse.message);

    const responseBody = {
      success: false,
      statusCode: httpStatus,
      error: isArrayError ? exceptionResponse.message : exceptionResponse
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

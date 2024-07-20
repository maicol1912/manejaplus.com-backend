import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { isArray, IsArray } from 'class-validator';

type ResponseException = string | { message?: string; details?: string; [key: string]: any };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    console.error('\x1b[41m\x1b[37m\x1b[1m NEW EXCEPTION ==> \x1b[0m', exception);
    console.error('\x1b[41m\x1b[37m\x1b[1m **END EXCEPTION**\x1b[0m');
    let exceptionResponse: ResponseException =
      exception instanceof HttpException
        ? exception.getResponse()
        : Array.isArray(exception)
          ? exception
          : exception === undefined || exception === null
            ? { message: 'Error desconocido' }
            : String(exception);
    const exceptionResponsee = exceptionResponse as any;

    const responseBody = {
      success: false,
      statusCode: httpStatus,
      error: exceptionResponsee?.message
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

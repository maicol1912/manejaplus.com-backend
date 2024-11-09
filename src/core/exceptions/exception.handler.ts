import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExceptionResponse } from './classes/exception-response';
import { CoreException } from './classes/core.exception';

type ResponseException = string | { message?: string; details?: string; [key: string]: any };

@Catch()
export class GlobalExceptionHandler implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus: HttpStatus;
    let responseBody: any;
    if (exception instanceof ExceptionResponse) {
      this.printException(exception.getResponse() || exception, host);
      httpStatus = exception.getStatus();
      responseBody = {
        success: false,
        statusCode: httpStatus,
        error: true,
        ...this.formatExceptionResponse(exception.getResponse()),
      };
    } else if (exception instanceof CoreException) {
      this.printException(
        exception.getAxiosErrorResponse() ?? exception,
        host,
        'Error al comunicarse con el servicio Core'
      );
      const axiosErrorResponse = exception.getAxiosErrorResponse();
      httpStatus = axiosErrorResponse.data?.status || 500;
      responseBody = {
        success: false,
        statusCode: axiosErrorResponse.data?.status || 500,
        error: axiosErrorResponse.data?.message ?? exception.getResponse(),
      };
    } else if (exception instanceof HttpException) {
      this.printException(exception.getResponse() || exception, host);
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ResponseException;
      responseBody = {
        success: false,
        statusCode: httpStatus,
        error:
          typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse.message || 'Error desconocido',
      };
    } else {
      this.printException(exception, host);
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        success: false,
        statusCode: httpStatus,
        error: 'Error desconocido',
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private formatExceptionResponse(exceptionResponse: any): any {
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      return { ...exceptionResponse };
    }
    return { error: exceptionResponse };
  }

  printException(exception: any, host: any, detail?: any) {
    console.error('\x1b[41m\x1b[37m\x1b[1m NEW EXCEPTION ==> \x1b[0m');
    console.error({
      detail,
      url: host.getArgs()[0]?.url,
      exception: exception,
    });
    console.error('\x1b[41m\x1b[37m\x1b[1m **END EXCEPTION**\x1b[0m');
  }
}

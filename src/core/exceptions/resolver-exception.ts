import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionResponse } from './classes/exception-response';

export function loggerRestException(error: any) {
  const { config, response } = error;
  const result: any = {};

  if (config) {
    result.code = error.code;
    result.responseUrl = config.url;

    if (config.data && typeof config.data === 'string') {
      try {
        result.requestData = JSON.parse(config.data);
      } catch (e) {
        console.error('Error parsing config.data:', e);
        result.requestData = config.data;
      }
    } else {
      result.requestData = config.data;
    }
  }

  if (response) {
    result.statusCode = response.status;
    result.statusText = response.statusText;
    result.responseData = response.data;
  }

  const filteredResult = Object.fromEntries(
    Object.entries(result).filter(([_, value]) => value != null && value !== undefined)
  );

  if (Object.keys(filteredResult).length > 0) {
    console.error('\x1b[41m\x1b[37m\x1b[1m NEW TRYCATCH EXCEPTION ==> \x1b[0m');
    console.error(filteredResult);
    console.error('\x1b[41m\x1b[37m\x1b[1m END TRYCATCH EXCEPTION ==> \x1b[0m');
  } else {
    console.error('\x1b[41m\x1b[37m\x1b[1m NEW TRYCATCH EXCEPTION ==> \x1b[0m');
    console.error(error);
    console.error('\x1b[41m\x1b[37m\x1b[1m END TRYCATCH EXCEPTION ==> \x1b[0m');
  }
}

export function handleException(e: any, response?: any): never {
  if (e instanceof ExceptionResponse || e instanceof HttpException) {
    throw e;
  } else {
    loggerRestException(e);

    let errorResponse: any = null;
    if (response) {
      errorResponse = response;
    } else {
      errorResponse = {
        error: true,
        activo: false,
        mensaje: 'Error interno del servidor',
      };
    }
    throw new ExceptionResponse(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

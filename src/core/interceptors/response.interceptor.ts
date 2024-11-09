import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import moment from 'moment-timezone';
import { map, Observable } from 'rxjs';

export interface Response {
  success?: boolean;
  data: any;
}

export interface TransformationInterceptorOptions {
  contentDispositionHeader?: string;
}

export class GlobalResponseInterceptor<T> implements NestInterceptor<T, Response> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest();
    const statusCode = response.statusCode;
    const method = request.method;
    const path = request.url;

    const contentType = response.get('Content-Type');
    if (contentType && contentType.startsWith('application')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((responseData) => {
        let success = responseData?.success;
        if (success === undefined) {
          success = statusCode >= 200 && statusCode < 300;
        }
        const formattedResponse = formatResponse(responseData);
        logResponse(formattedResponse, method, path, statusCode);
        return {
          success: success,
          data: formattedResponse,
        };
      })
    );
  }
}

function formatResponse(response: any) {
  if (Array.isArray(response)) {
    return { data: response };
  }
  if (typeof response === 'string') {
    return response;
  }
  return response || {};
}

function logResponse(response: any, method: string, path: string, statusCode: number) {
  const timestamp = moment().format('DD/MMM/YYYY HH:mm:ss');

  console.log(`[${timestamp}] "${method} ${path} HTTP/1.1" ${statusCode}`);
}

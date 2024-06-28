import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response {
  success?: boolean;
  data: any;
}

export interface TransformationInterceptorOptions {
  contentDispositionHeader?: string;
}

export class TransformationResponseInterceptor<T> implements NestInterceptor<T, Response> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    const contentType = response.get('Content-Type');
    if (contentType && contentType.startsWith('application')) {
      return next.handle();
    }
    return next.handle().pipe(
      map(response => {
        const builderStatus = response?.status;
        let success = response?.success;
        if (!success) {
          success = statusCode >= 200 && statusCode <= 207;
        }

        return {
          success: success,
          data: response || {}
        };
      })
    );
  }
}

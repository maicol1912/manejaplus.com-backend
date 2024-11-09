import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { getConnection } from 'typeorm';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenant = request.headers['x-tenant-id'];

    if (tenant) {
      request.tenant = tenant;
      
      // Cambiar el schema para la conexión actual
      const connection = getConnection();
      await connection.query(`SET search_path TO "${tenant}"`);
    }

    return next.handle();
  }
}
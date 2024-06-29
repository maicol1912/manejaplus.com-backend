import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        const tenantName = payload.organization.name;

        await this.setTenantContext(tenantName);
      } catch (error) {}
    }

    return next.handle();
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async setTenantContext(tenantName: string) {
    await this.dataSource.query(`SET search_path TO ${tenantName}`);
  }
}

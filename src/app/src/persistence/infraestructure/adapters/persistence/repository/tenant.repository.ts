import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TenantEntity } from '../entity/tenant.entity';

@Injectable()
export class TenantRepositoryImpl {
  private tenantRepo: Repository<TenantEntity>;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.tenantRepo = this.dataSource.getRepository(TenantEntity);
  }

  public async createTenant(tenantEntity: TenantEntity): Promise<Partial<TenantEntity>> {
    return await this.tenantRepo.save(tenantEntity);
  }
}

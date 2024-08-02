import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, ObjectLiteral } from 'typeorm';

@Injectable()
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;
  private transactionManager: EntityManager | null = null;

  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private entityType: new () => T
  ) {
    this.repository = this.dataSource.getRepository(this.entityType);
  }

  protected getManager(): EntityManager {
    return this.transactionManager || this.dataSource.manager;
  }

  public setTransactionManager(manager: EntityManager | null) {
    this.transactionManager = manager;
  }
}

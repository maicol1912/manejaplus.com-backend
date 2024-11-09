import { AtLeastOneProperty } from 'src/core/types/least-one-propertie';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, ObjectLiteral, FindOptionsWhere } from 'typeorm';

@Injectable()
export abstract class BaseRepository<T extends ObjectLiteral, ID extends keyof T> {
  protected repository: Repository<T>;
  private transactionManager: EntityManager | null = null;
  private readonly idField: ID;

  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private entityType: new () => T,
    idField: ID
  ) {
    this.repository = this.dataSource.getRepository(this.entityType);
    this.idField = idField;
  }

  protected getManager(): EntityManager {
    return this.transactionManager || this.dataSource.manager;
  }

  public setTransactionManager(manager: EntityManager | null) {
    this.transactionManager = manager;
  }

  public async findManyByField<U extends AtLeastOneProperty<T>>(query: U): Promise<T[]> {
    if (!query) {
      return [];
    }

    const whereClause: FindOptionsWhere<T> = {};

    (Object.keys(query) as (keyof U)[]).forEach((key) => {
      if (typeof query[key] === 'object' && query[key] !== null) {
        const relation = this.repository.metadata.relations.find((r) => r.propertyName === key);
        if (relation) {
          whereClause[key as keyof T] = query[key] as any;
        } else {
          console.warn(`La propiedad "${String(key)}" no existe en la entidad y será ignorada.`);
        }
      } else {
        if (this.repository.metadata.findColumnWithPropertyName(key as string)) {
          whereClause[key as keyof T] = query[key] as any;
        } else {
          console.warn(`La propiedad "${String(key)}" no existe en la entidad y será ignorada.`);
        }
      }
    });

    if (Object.keys(whereClause).length === 0 || Object.values(whereClause).some((value) => value === undefined)) {
      throw new Error('No se proporcionaron campos válidos para la búsqueda.');
    }

    return await this.getManager().find(this.entityType, {
      where: whereClause,
    });
  }

  public async findByField<U extends AtLeastOneProperty<T>>(query: U): Promise<T | null> {
    if (!query) {
      return null;
    }

    const whereClause: FindOptionsWhere<T> = {};

    (Object.keys(query) as (keyof U)[]).forEach((key) => {
      if (typeof query[key] === 'object' && query[key] !== null) {
        const relation = this.repository.metadata.relations.find((r) => r.propertyName === key);
        if (relation) {
          whereClause[key as keyof T] = query[key] as any;
        } else {
          console.warn(`La propiedad "${String(key)}" no existe en la entidad y será ignorada.`);
        }
      } else {
        if (this.repository.metadata.findColumnWithPropertyName(key as string)) {
          whereClause[key as keyof T] = query[key] as any;
        } else {
          console.warn(`La propiedad "${String(key)}" no existe en la entidad y será ignorada.`);
        }
      }
    });

    if (Object.keys(whereClause).length === 0 || Object.values(whereClause).some((value) => value === undefined)) {
      throw new Error('No se proporcionaron campos válidos para la búsqueda.');
    }

    return await this.getManager().findOne(this.entityType, {
      where: whereClause,
    });
  }

  public async save(entity: T): Promise<T> {
    return this.getManager().save(this.entityType, entity);
  }

  public async findById(id: string | number): Promise<T | null> {
    if (!id) {
      return null;
    }

    const whereCondition: FindOptionsWhere<T> = {
      [this.idField]: id as any,
    } as FindOptionsWhere<T>;
    return this.getManager().findOne(this.entityType, {
      where: whereCondition,
    });
  }

  public async findAll(): Promise<T[]> {
    return this.getManager().find(this.entityType, {});
  }

  public async update(id: string | number, entity: Partial<T>): Promise<T> {
    if (id === undefined) {
      return null;
    }

    await this.getManager().update(this.entityType, { [this.idField]: id as any }, entity);
    return this.findById(id);
  }

  public async delete(id: string | number): Promise<void> {
    if (id === undefined) {
      return null;
    }

    await this.getManager().delete(this.entityType, {
      [this.idField]: id as any,
    });
  }
}

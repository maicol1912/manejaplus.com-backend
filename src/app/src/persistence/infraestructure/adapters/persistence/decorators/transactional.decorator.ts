import { DataSource } from 'typeorm';
import { Inject } from '@nestjs/common';
import { BaseRepository } from '../repository/base.repository';

export const TRANSACTION_MANAGER = Symbol('TRANSACTION_MANAGER');

export function Transactional() {
  const injectDataSource = Inject(DataSource);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    injectDataSource(target, 'dataSource');
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const dataSource: DataSource = (this as any).dataSource;

      if (!dataSource) {
        throw new Error('DataSource not found. Make sure it is properly injected.');
      }

      if ((this as any)[TRANSACTION_MANAGER]) {
        return originalMethod.apply(this, args);
      }

      return await dataSource.transaction(async transactionalEntityManager => {
        (this as any)[TRANSACTION_MANAGER] = transactionalEntityManager;

        Object.values(this).forEach(value => {
          if (value instanceof BaseRepository) {
            value.setTransactionManager(transactionalEntityManager);
          }
        });

        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } finally {
          delete (this as any)[TRANSACTION_MANAGER];

          Object.values(this).forEach(value => {
            if (value instanceof BaseRepository) {
              value.setTransactionManager(null);
            }
          });
        }
      });
    };

    return descriptor;
  };
}

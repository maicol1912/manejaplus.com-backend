import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ProductEntity } from '@app/products/infraestructure/adapters/persistence/entity/product.entity';

@Injectable()
export class ProductService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  async findAll(tenant: string): Promise<ProductEntity[]> {
    await this.entityManager.query(`SET search_path TO ${tenant}`);

    return await this.entityManager.find(ProductEntity);
  }

  async findById(id: number, tenant: string): Promise<ProductEntity> {
    await this.entityManager.query(`SET search_path TO ${tenant}`);

    return await this.entityManager.findOne(ProductEntity, { where: { id } });
  }

  async create(productData: Partial<ProductEntity>, tenant: string): Promise<ProductEntity> {
    await this.entityManager.query(`SET search_path TO ${tenant}`);

    const product = this.entityManager.create(ProductEntity, productData);
    return await this.entityManager.save(ProductEntity, product);
  }
}

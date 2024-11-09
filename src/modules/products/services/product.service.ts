import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ProductEntity } from '@persistence/entities/custom/product.entity';
import { EntityManager } from 'typeorm';

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
